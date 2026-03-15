import Redis from 'ioredis';
import { logger } from './errorHandler.js';

let redis = null;
const memoryCache = new Map();

// Initialize Redis if URL is provided
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    redis.on('error', (err) => {
      logger.warn('Redis connection issue, falling back to memory cache:', err.message);
    });
    
    redis.on('connect', () => {
      logger.info('🚀 Connected to Redis cluster');
    });
  } catch (error) {
    logger.warn('Failed to initialize Redis client:', error.message);
  }
} else {
  logger.info('Redis URL not found, using memory cache only');
}

/**
 * Cache middleware generator
 * @param {number} ttl - Time to live in seconds
 */
export const cache = (ttl = 300) => async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = `f1:cache:${req.originalUrl}`;
  
  try {
    // 1. Try Redis
    if (redis && redis.status === 'ready') {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } 
    // 2. Try Memory Fallback
    else {
      const memCached = memoryCache.get(key);
      if (memCached && memCached.expiry > Date.now()) {
        return res.json(memCached.data);
      }
    }
  } catch (error) {
    logger.error('Cache read error:', error);
  }

  // Override res.json to intercept and store data
  const originalJson = res.json;
  res.json = function(data) {
    res.json = originalJson; // Restore
    
    // Only cache successful responses
    if (res.statusCode === 200) {
      try {
        if (redis && redis.status === 'ready') {
          redis.setex(key, ttl, JSON.stringify(data));
        } else {
          memoryCache.set(key, {
            data,
            expiry: Date.now() + (ttl * 1000)
          });
        }
      } catch (err) {
        logger.error('Cache write error:', err);
      }
    }
    
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Clear all cache starting with specific pattern
 */
export const clearCache = async (pattern = 'f1:cache:*') => {
  try {
    if (redis && redis.status === 'ready') {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
    
    // Clear relevant memory keys
    const matchBase = pattern.replace(/\*/g, '');
    for (const key of memoryCache.keys()) {
      if (key.startsWith(matchBase)) {
        memoryCache.delete(key);
      }
    }
    
    logger.info(`🧹 Cache cleared for pattern: ${pattern}`);
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};
