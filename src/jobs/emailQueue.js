import { Queue } from "bullmq";
import { isMock, getBullMQConnection } from "../config/redis.js";
import logger from "../config/logger.js";

let emailQueue;
let mockProcessor = null;

// Registry helper for mock processor callback
export const registerMockProcessor = (processor) => {
  mockProcessor = processor;
};

const useInMemoryQueue = isMock || process.env.VERCEL;

if (useInMemoryQueue) {
  if (process.env.VERCEL) {
    logger.warn("Serverless environment detected (Vercel). BullMQ running in synchronous inline fallback mode.");
  } else {
    logger.warn("Redis Mock active. BullMQ running in local non-blocking setImmediate mode.");
  }
  
  // Expose mock queue interface matching standard BullMQ
  emailQueue = {
    add: async (jobName, data) => {
      logger.info(`[BullMQ MOCK] Queueing job '${jobName}' in-memory.`);
      
      const executeJob = async () => {
        if (mockProcessor) {
          try {
            logger.info(`[BullMQ MOCK] Processing job '${jobName}' in-memory.`);
            await mockProcessor({ name: jobName, data });
          } catch (err) {
            logger.error(`[BullMQ MOCK] Job execution failed: ${err.message}`);
          }
        } else {
          logger.warn(`[BullMQ MOCK] Job '${jobName}' ignored. No worker processor registered.`);
        }
      };

      if (process.env.VERCEL) {
        // Await execution inline synchronously to prevent Vercel container freeze before completion
        await executeJob();
      } else {
        // Asynchronous non-blocking execution to mimic Redis background queueing
        setImmediate(executeJob);
      }
      
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
