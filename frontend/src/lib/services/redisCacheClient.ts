// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. - Resilient Redis Cache Client
// 'Durable' and 'Fortified' with robust connection management and error handling.

import Redis from 'ioredis';
import { environment } from '../config/environment';

class RedisCacheClient {
  private client: Redis | null = null;
  private isConnecting = false;

  constructor() {
    // G.O.A.T. C.O.D.E.X. B.O.T. - Connection will be established lazily on first use
    // to prevent app crash if Redis is not available at startup.
  }

  private connect() {
    if (this.client || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    console.log('[RedisCacheClient] Connecting to Redis...');

    try {
      if (!environment.redisUrl) {
        console.error(
          '[RedisCacheClient] Connection attempt failed: REDIS_URL is not defined.'
        );
        this.isConnecting = false;
        return;
      }
      const redisClient = new Redis(environment.redisUrl, {
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true, // Connect on first command
      });

      redisClient.on('connect', () => {
        console.log('[RedisCacheClient] Successfully connected to Redis.');
        this.client = redisClient;
        this.isConnecting = false;
      });

      redisClient.on('error', (err) => {
        console.error('[RedisCacheClient] Redis connection error:', err);
        this.client?.disconnect();
        this.client = null;
        this.isConnecting = false;
      });

      redisClient.on('end', () => {
        console.log('[RedisCacheClient] Redis connection closed.');
        this.client = null;
        this.isConnecting = false;
      });

      // Initial connection attempt
      redisClient.connect().catch((err) => {
        console.error(
          '[RedisCacheClient] Initial Redis connection failed:',
          err
        );
        this.isConnecting = false;
      });
    } catch (error) {
      console.error(
        '[RedisCacheClient] Failed to create Redis client instance:',
        error
      );
      this.isConnecting = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.client) {
      if (environment.redisUrl) {
        this.connect(); // Attempt to connect now
        await this.waitForConnection(); // Wait for connection to establish
      }
      if (!this.client) {
        console.warn(
          '[RedisCacheClient] Get operation skipped: Redis is not available.'
        );
        return null;
      }
    }
    try {
      const data = await this.client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(
        `[RedisCacheClient] Error getting data for key "${key}":`,
        error
      );
    }
    return null;
  }

  private waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client?.status === 'ready') {
        return resolve();
      }
      const checkInterval = setInterval(() => {
        if (this.client?.status === 'ready' || !this.isConnecting) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(); // Resolve anyway after a timeout
      }, 5000);
    });
  }

  public async set(
    key: string,
    value: object,
    ttlSeconds: number
  ): Promise<void> {
    if (!this.client) {
      if (environment.redisUrl) {
        this.connect(); // Attempt to connect now
        await this.waitForConnection(); // Wait for connection to establish
      }
      if (!this.client) {
        console.warn(
          '[RedisCacheClient] Set operation skipped: Redis is not available.'
        );
        return;
      }
    }
    try {
      const stringValue = JSON.stringify(value);
      await this.client.set(key, stringValue, 'EX', ttlSeconds);
    } catch (error) {
      console.error(
        `[RedisCacheClient] Error setting data for key "${key}":`,
        error
      );
    }
  }
}

export const redisCacheClient = new RedisCacheClient();
