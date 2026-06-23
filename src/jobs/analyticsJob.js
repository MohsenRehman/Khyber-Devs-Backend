import { aggregateDailyStats } from "../services/analytics.service.js";
import logger from "../config/logger.js";

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Runs analytics aggregations for today and yesterday.
 */
export const runAnalyticsAggregation = async () => {
  try {
    const yesterday = getYesterdayDateString();
    const today = getTodayDateString();
    
    logger.info(`Starting scheduled daily analytics aggregation for ${yesterday} and ${today}...`);
    
    // Aggregate both yesterday (completed day) and today (real-time progress)
    await aggregateDailyStats(yesterday);
    await aggregateDailyStats(today);
    
    logger.info("Daily analytics aggregation completed successfully.");
  } catch (error) {
    logger.error(`Scheduled analytics job failed: ${error.message}`);
  }
};

// Initialize Background Interval Runner
const initAnalyticsJob = () => {
  logger.info("Initializing scheduled daily analytics aggregator job...");

  // Run immediately on boot to ensure current summaries are populated
  setImmediate(async () => {
    await runAnalyticsAggregation();
  });

  // Run every 12 hours to update current day's real-time statistics
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  setInterval(async () => {
    logger.info("Running periodic analytics aggregation...");
    await runAnalyticsAggregation();
  }, TWELVE_HOURS);
};

initAnalyticsJob();

export default initAnalyticsJob;
