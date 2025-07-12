// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. - Resilient Redis Cache Client
// 'Durable' and 'Fortified' with robust connection management and error handling.

import Redis from 'ioredis';
import { environment } from '../config/environment';

class RedisCacheClient {
  private client: Redis | null = null;
  private isConnecting = false;

  constructor() {
    // Connect only if Redis is configured in the environment
    if (environment.redisUrl) {
      this.connect();
    }
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
      console.warn(
        '[RedisCacheClient] Get operation failed: Redis is not connected.'
      );
      return null;
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

  public async set(
    key: string,
    value: object,
    ttlSeconds: number
  ): Promise<void> {
    if (!this.client) {
      console.warn(
        '[RedisCacheClient] Set operation failed: Redis is not connected.'
      );
      return;
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
