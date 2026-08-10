const { redisClient, getIsConnected } = require('../config/redis');
const { logger } = require('../utils/logger');

// Local in-memory store fallback
const memoryCache = new Map();

const cacheService = {
  get: async (key) => {
    try {
      if (getIsConnected()) {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } else {
        const item = memoryCache.get(key);
        if (!item) return null;
        if (item.expiry && item.expiry < Date.now()) {
          memoryCache.delete(key);
          return null;
        }
        return item.value;
      }
    } catch (error) {
      logger.error(`Cache Get Error for key ${key}: ${error.message}`);
      return null;
    }
  },

  set: async (key, value, ttlSeconds = 300) => {
    try {
      if (getIsConnected()) {
        await redisClient.set(key, JSON.stringify(value), {
          EX: ttlSeconds
        });
      } else {
        memoryCache.set(key, {
          value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
      }
      return true;
    } catch (error) {
      logger.error(`Cache Set Error for key ${key}: ${error.message}`);
      return false;
    }
  },

  del: async (key) => {
    try {
      if (getIsConnected()) {
        await redisClient.del(key);
      } else {
        memoryCache.delete(key);
      }
      return true;
    } catch (error) {
      logger.error(`Cache Del Error for key ${key}: ${error.message}`);
      return false;
    }
  },

  flush: async () => {
    try {
      if (getIsConnected()) {
        await redisClient.flushAll();
      } else {
        memoryCache.clear();
      }
      return true;
    } catch (error) {
      logger.error(`Cache Flush Error: ${error.message}`);
      return false;
    }
  }
};

module.exports = cacheService;
