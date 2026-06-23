import { Queue } from "bullmq";
import { isMock, getBullMQConnection } from "../config/redis.js";
import logger from "../config/logger.js";

let emailQueue;
let mockProcessor = null;

// Registry helper for mock processor callback
export const registerMockProcessor = (processor) => {
  mockProcessor = processor;
};

if (isMock) {
  logger.warn("Redis Mock active. BullMQ running in local non-blocking setImmediate mode.");
  
  // Expose mock queue interface matching standard BullMQ
  emailQueue = {
    add: async (jobName, data) => {
      logger.info(`[BullMQ MOCK] Queueing job '${jobName}' in-memory.`);
      
      // Asynchronous non-blocking execution to mimic Redis background queueing
      setImmediate(async () => {
        if (mockProcessor) {
          try {
            logger.info(`[BullMQ MOCK] Processing job '${jobName}' in background.`);
            await mockProcessor({ name: jobName, data });
          } catch (err) {
            logger.error(`[BullMQ MOCK] Job execution failed: ${err.message}`);
          }
        } else {
          logger.warn(`[BullMQ MOCK] Job '${jobName}' ignored. No worker processor registered.`);
        }
      });
      
      return { id: `mock-job-${Date.now()}` };
    },
  };
} else {
  try {
    emailQueue = new Queue("emailQueue", {
      connection: getBullMQConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000, // wait 5s before retrying email
        },
        removeOnComplete: true,
      },
    });
    logger.info("BullMQ Email Queue successfully registered on Redis cluster.");
  } catch (err) {
    logger.error(`Failed to register BullMQ Queue: ${err.message}`);
  }
}

export { emailQueue };
export default emailQueue;
