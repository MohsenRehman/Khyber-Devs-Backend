import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient, isMock } from "../config/redis.js";
import logger from "../config/logger.js";

const getStore = () => {
  if (isMock) {
    logger.debug("Rate limiting store: falling back to MemoryStore (Redis Mock active).");
    return undefined; // Returns default express-rate-limit MemoryStore
  }

  try {
    return new RedisStore({
      // ioredis sendCommand implementation
      sendCommand: async (...args) => {
        return redisClient.call(args[0], ...args.slice(1));
      },
    });
  } catch (err) {
    logger.error(`Error initializing RedisStore for rate limiting: ${err.message}. Falling back to MemoryStore.`);
    return undefined;
  }
};

/**
 * Creates a rate limiter instance.
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Max requests allowed per IP within window
 * @param {string} message - Overriding error message
 */
export const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    // ── Skip rate limiting entirely in development ──────────────────────────
    // Rate limiting is a production-only safeguard. In dev it only blocks
    // the developer during rapid testing/debugging sessions.
    skip: () => process.env.NODE_ENV === "development",
    // ────────────────────────────────────────────────────────────────────────
    message: {
      success: false,
      message: message || "Too many requests from this connection. Please try again later.",
      errors: ["Rate limit exceeded"],
    },
    standardHeaders: true,  // Return standard rate limit headers
    legacyHeaders: false,   // Disable old X-RateLimit headers
    store: getStore(),
  });
};

export default createLimiter;
