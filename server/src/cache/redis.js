import Redis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.fallbackStore = new Map();
    this.init();
  }

  init() {
    if (config.isTest) {
      this.isConnected = false;
      return;
    }

    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 3) {
            return null; // stop retrying and use in-memory fallback
          }
          return Math.min(times * 200, 1000);
        },
        reconnectOnError(err) {
          logger.warn(`Redis reconnect error: ${err.message}`);
          return false;
        },
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        logger.info('Connected to Redis Cache Server successfully');
      }).catch((err) => {
        this.isConnected = false;
        logger.warn(`Redis connection failed (${err.message}). Using in-memory fallback store.`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // Suppress repetitive log spam on offline
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('Redis Cache ready');
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });
    } catch (err) {
      this.isConnected = false;
      logger.warn(`Redis init exception (${err.message}). Using in-memory fallback store.`);
    }
  }

  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const val = await this.client.get(key);
        return val ? JSON.parse(val) : null;
      }
    } catch (err) {
      logger.warn(`Redis get error for ${key}: ${err.message}`);
    }

    // In-memory fallback
    const item = this.fallbackStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.fallbackStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      if (this.isConnected && this.client) {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return true;
      }
    } catch (err) {
      logger.warn(`Redis set error for ${key}: ${err.message}`);
    }

    // In-memory fallback
    this.fallbackStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return true;
  }

  async del(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
    } catch (err) {
      logger.warn(`Redis del error for ${key}: ${err.message}`);
    }
    this.fallbackStore.delete(key);
  }

  async delPattern(pattern) {
    try {
      if (this.isConnected && this.client) {
        const keys = await this.client.keys(pattern);
        if (keys && keys.length > 0) {
          await this.client.del(...keys);
        }
      }
    } catch (err) {
      logger.warn(`Redis delPattern error for ${pattern}: ${err.message}`);
    }

    // Clear fallback matching prefix
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.fallbackStore.keys()) {
      if (regexPattern.test(key)) {
        this.fallbackStore.delete(key);
      }
    }
  }

  async flushAll() {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushall();
      }
    } catch (err) {
      logger.warn(`Redis flushAll error: ${err.message}`);
    }
    this.fallbackStore.clear();
  }

  getStatus() {
    return {
      connected: this.isConnected,
      mode: this.isConnected ? 'redis' : 'in-memory-fallback',
      inMemoryKeysCount: this.fallbackStore.size,
    };
  }
}

export const cache = new CacheService();
