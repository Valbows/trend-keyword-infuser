// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. Principles in Action
// This file embodies a 'Fortified' and 'Durable' approach to external API interaction.

import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  GenerateContentResult,
  HarmCategory,
  HarmBlockThreshold,
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
  private requestQueue: (() => Promise<any>)[] = [];
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

  private getGenerativeModel(): any {
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
    } catch (error: any) {
      const isRateLimitError = error.message?.includes('429');
      const isHardQuotaError = isRateLimitError && error.message?.includes('exceeded your current quota');
      const isServerError = error.message?.includes('503') || error.message?.includes('500');

      // 'Evolving' Logic: If it's a hard quota error, stop immediately.
      if (isHardQuotaError) {
        console.error('[GeminiClientWrapper] Daily quota exceeded. No further retries will be attempted for this request.');
        throw error; // Re-throw immediately, no retry.
      }

      // For transient rate limits or server errors, retry with backoff.
      if (retries > 0 && (isRateLimitError || isServerError)) {
        console.warn(
          `[GeminiClientWrapper] Retrying due to ${isRateLimitError ? '429' : 'server'} error. Retries left: ${retries - 1}`
        );
        await new Promise(res => setTimeout(res, backoff));
        return this.executeWithRetry(fn, retries - 1, backoff * 2); // Exponential backoff
      }
      throw error;
    }
  }
}

// --- Singleton Instance ---
// 'Fortified' Access: Securely retrieve the API key from server-side environment variables.
const geminiApiKey = process.env.GEMINI_API_KEY;

// Initialize the client. A try-catch block handles potential initialization errors,
// such as a missing API key, making the setup 'Durable'.
let geminiClient: GeminiClientWrapper;
try {
  geminiClient = new GeminiClientWrapper(geminiApiKey || '');
} catch (error) {
  console.error('[GeminiClientWrapper] Failed to initialize:', error);
  // In a production environment, you might want to set up a mock client here
  // to prevent the entire application from crashing.
}

export { geminiClient, HarmCategory, HarmBlockThreshold };
export type { GenerateContentRequest };
