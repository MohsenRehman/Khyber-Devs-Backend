import Settings from "../models/Settings.js";
import redisClient from "../config/redis.js";
import logger from "../config/logger.js";

const CACHE_KEY = "settings:global";

export const getSettings = async () => {
  // 1. Try reading from Redis cache
  try {
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      logger.debug("System settings retrieved from Redis cache.");
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.error(`Redis cache read error in getSettings: ${err.message}`);
  }

  // 2. Fallback to MongoDB
  let settings = await Settings.findOne().populate("updatedBy", "name email");

  // 3. Auto-initialize default settings record if database is empty
  if (!settings) {
    logger.info("No global settings record found. Initializing defaults.");
    settings = await Settings.create({});
  }

  // 4. Write back to Redis cache (expire in 24 hours)
  try {
    await redisClient.set(CACHE_KEY, JSON.stringify(settings), "EX", 24 * 60 * 60);
  } catch (err) {
    logger.error(`Redis cache write error in getSettings: ${err.message}`);
  }

  return settings;
};

export const updateSettings = async (updateData, adminId) => {
  let settings = await Settings.findOne();

  const data = {
    ...updateData,
    updatedBy: adminId,
  };

  if (!settings) {
    settings = await Settings.create(data);
  } else {
    // Dynamically update fields
    Object.assign(settings, data);
    await settings.save();
  }

  // Fetch complete populated record
  const updatedRecord = await Settings.findById(settings._id).populate("updatedBy", "name email");

  // Invalidate Redis cache
  try {
    await redisClient.del(CACHE_KEY);
    logger.info("Global settings cache invalidated successfully.");
  } catch (err) {
    logger.error(`Failed to invalidate settings cache: ${err.message}`);
  }

  return updatedRecord;
};
