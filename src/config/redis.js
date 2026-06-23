import Redis from "ioredis";
import logger from "./logger.js";

// Class implementing basic standard Redis commands in-memory as a fallback
class InMemoryRedisMock {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
    logger.warn("Redis client running in InMemory fallback mock mode.");
  }

  async get(key) {
    this._checkExpired(key);
    return this.store.get(key) || null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, value);
    if (mode === "EX" && duration) {
      this.ttls.set(key, Date.now() + duration * 1000);
    }
    return "OK";
  }

  async del(key) {
    const deleted = this.store.delete(key);
    this.ttls.delete(key);
    return deleted ? 1 : 0;
  }

  async keys(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const matched = [];
    for (const key of this.store.keys()) {
      this._checkExpired(key);
      if (this.store.has(key) && regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  }

  async incr(key) {
    this._checkExpired(key);
    let val = parseInt(this.store.get(key) || "0", 10);
    val += 1;
    this.store.set(key, String(val));
    return val;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      this.ttls.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async ping() {
    return "PONG";
  }

  _checkExpired(key) {
    if (this.ttls.has(key) && this.ttls.get(key) < Date.now()) {
      this.store.delete(key);
      this.ttls.delete(key);
    }
  }

  on(event, handler) {
    // Simply swallow connection events in mock mode
  }
}

let redisClient;
let isMock = false;

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn("REDIS_URL not configured. Initializing InMemoryRedisMock fallback.");
    redisClient = new InMemoryRedisMock();
    isMock = true;
    return;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      reconnectOnError: () => true,
    });

    redisClient.on("connect", () => {
      logger.info("Connecting to Redis host...");
    });

    redisClient.on("ready", () => {
      logger.info("Redis server connection successfully established.");
    });

    redisClient.on("error", (error) => {
      logger.error(`Redis Server error: ${error.message}`);
      if (!redisClient.status || redisClient.status === "end") {
        logger.warn("Switching to InMemoryRedisMock due to persistent Redis failures.");
        redisClient = new InMemoryRedisMock();
        isMock = true;
      }
    });
  } catch (error) {
    logger.error(`Redis Initialization failed: ${error.message}. Using InMemoryRedisMock.`);
    redisClient = new InMemoryRedisMock();
    isMock = true;
  }
};

initRedis();

/**
 * getBullMQConnection — Creates a dedicated Redis connection for BullMQ Queue/Worker.
 * BullMQ Workers require maxRetriesPerRequest = null because they use blocking commands.
 * Using the shared redisClient causes the "maxRetriesPerRequest must be null" BullMQ error.
 * Returns null when running in mock mode so callers can fall back to InMemory behaviour.
 */
export const getBullMQConnection = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl || isMock) return null;

  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,  // Required by BullMQ workers
    enableReadyCheck: false,
    connectTimeout: 5000,
    reconnectOnError: () => true,
  });
};

export { redisClient, isMock };
export default redisClient;
