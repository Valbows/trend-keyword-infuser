// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. Principles in Action
// This file embodies a 'Fortified' and 'Durable' approach to external API interaction.

import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  GenerateContentResult,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel, // S.A.F.E. - Added missing import for type safety
} from '@google/generative-ai';
import { AI_MODEL_NAME } from '@/lib/config/ai';

// --- Configuration ---
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_CONCURRENT_REQUESTS = 5;
const TOKENS_PER_INTERVAL = 10; // Allow 10 requests
const INTERVAL_MS = 1000; // Per second

class GeminiClientWrapper {
  private genAI: GoogleGenerativeAI;
  private requestQueue: (() => Promise<void>)[] = [];
  private activeRequests = 0;
  private tokens: number;
  private lastRefill: number;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error('[GeminiClientWrapper] API key is missing. Service will be disabled.');
      throw new Error('Gemini API key not provided.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.tokens = TOKENS_PER_INTERVAL;
    this.lastRefill = Date.now();

    // Start a timer to refill the token bucket
    setInterval(() => this.refillTokens(), INTERVAL_MS);
  }

  private refillTokens() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / INTERVAL_MS) * TOKENS_PER_INTERVAL;
    this.tokens = Math.min(TOKENS_PER_INTERVAL, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private async acquireToken(): Promise<void> {
    return new Promise(resolve => {
      const tryAcquire = () => {
        if (this.tokens >= 1) {
          this.tokens -= 1;
          resolve();
        } else {
          setTimeout(tryAcquire, 100); // Wait for tokens to refill
        }
      };
      tryAcquire();
    });
  }

  private getGenerativeModel(): GenerativeModel {
    // For some reason, the model needs to be re-initialized for each request to avoid an issue
    // where the model hangs on the second request.
    return this.genAI.getGenerativeModel({ model: AI_MODEL_NAME });
  }

  public async generateContent(request: GenerateContentRequest): Promise<GenerateContentResult> {
    return this.enqueue(async () => {
      return this.executeWithRetry(async () => {
        const model = this.getGenerativeModel();
        return await model.generateContent(request);
      });
    });
  }

  private async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const runTask = async () => {
        if (this.activeRequests >= MAX_CONCURRENT_REQUESTS) {
          this.requestQueue.push(runTask);
          return;
        }

        this.activeRequests++;
        try {
          await this.acquireToken();
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };
      this.requestQueue.push(runTask);
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.requestQueue.length > 0 && this.activeRequests < MAX_CONCURRENT_REQUESTS) {
      const nextTask = this.requestQueue.shift();
      if (nextTask) {
        nextTask();
      }
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF_MS): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      // S.A.F.E. - Handle 'unknown' error type correctly
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimitError = errorMessage.includes('429');
      const isHardQuotaError = isRateLimitError && errorMessage.includes('exceeded your current quota');
      const isServerError = errorMessage.includes('503') || errorMessage.includes('500');

      // 'Evolving' Logic: If it's a hard quota error, stop immediately.
      if (isHardQuotaError) {
        console.error('[GeminiClientWrapper] Hard quota limit reached. Halting retries.', { error });
        throw error; // Re-throw the original error to be caught by the caller
      }

      // 'Durable' Logic: Retry on transient server errors or temporary rate limits.
      if (retries > 0 && (isRateLimitError || isServerError)) {
        console.warn(`[GeminiClientWrapper] Retrying request. Retries left: ${retries - 1}`, { error });
        await new Promise(res => setTimeout(res, backoff));
        return this.executeWithRetry(fn, retries - 1, backoff * 2); // Exponential backoff
      }

      console.error('[GeminiClientWrapper] Non-retriable error or max retries reached.', { error });
      throw error; // Re-throw for other errors
    }
  }
}

// --- Singleton Instance ---
// 'Fortified' Access: Securely retrieve the API key from server-side environment variables.
const geminiApiKey = process.env.GEMINI_API_KEY;

let geminiClientWrapper: GeminiClientWrapper | null = null;

if (geminiApiKey) {
  geminiClientWrapper = new GeminiClientWrapper(geminiApiKey);
} else {
  console.warn('[GeminiClientWrapper] GEMINI_API_KEY is not set. The Gemini client will not be initialized.');
}

// S.A.F.E. - Exporting client and enums for modular use across the application.
export const geminiClient = geminiClientWrapper;
export { HarmCategory, HarmBlockThreshold };

// --- Safety Settings ---
// S.A.F.E. Principle: Configure strict safety settings to block harmful content.
export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export type { GenerateContentRequest };
