import redisClient from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Gets cached JSON parsed value from Redis.
 * @param {string} key - Redis key name
 * @returns {object|array|null} Cached value or null
 */
export const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      logger.debug(`Redis cache hit for key: ${key}`);
      return JSON.parse(data);
    }
  } catch (err) {
    logger.error(`Redis cache get error for key [${key}]: ${err.message}`);
  }
  return null;
};

/**
 * Sets JSON stringified value in Redis cache with an expiration.
 * @param {string} key - Redis key name
 * @param {object|array} data - Value to cache
 * @param {number} ttlSeconds - Expiration time in seconds (default: 3600 / 1 hour)
 */
export const setCachedData = async (key, data, ttlSeconds = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(data), "EX", ttlSeconds);
    logger.debug(`Redis cache set completed for key: ${key}`);
  } catch (err) {
    logger.error(`Redis cache set error for key [${key}]: ${err.message}`);
  }
};

/**
 * Deletes keys matching a wildcard pattern or exact key name to invalidate caches.
 * @param {string} pattern - Key pattern (e.g. 'cms:services*') or exact key
 */
export const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await Promise.all(keys.map((key) => redisClient.del(key)));
      logger.info(`Redis cache keys matching pattern [${pattern}] invalidated: ${keys.join(", ")}`);
    } else {
      // In case keys() returned nothing, try deleting pattern as an exact key directly
      await redisClient.del(pattern);
    }
  } catch (err) {
    logger.error(`Redis cache invalidation error for pattern [${pattern}]: ${err.message}`);
  }
};
