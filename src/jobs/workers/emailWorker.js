import { Worker } from "bullmq";
import { isMock, getBullMQConnection } from "../../config/redis.js";
import logger from "../../config/logger.js";
import { registerMockProcessor } from "../emailQueue.js";
import {
  sendLeadAdminNotification,
  sendLeadClientConfirmation,
  sendApplicationAdminNotification,
  sendApplicationCandidateConfirmation,
} from "../../services/email.service.js";

/**
 * Common background worker processing core
 */
export const processEmailJob = async (job) => {
  const { name, data } = job;
  logger.info(`Starting background email worker for job type: ${name}`);

  try {
    switch (name) {
      case "lead.created": {
        const { lead } = data;
        // Dispatch both notifications concurrently
        await Promise.all([
          sendLeadAdminNotification(lead),
          sendLeadClientConfirmation(lead),
        ]);
        break;
      }
      case "application.created": {
        const { application, job: position } = data;
        await Promise.all([
          sendApplicationAdminNotification(application, position),
          sendApplicationCandidateConfirmation(application, position),
        ]);
        break;
      }
      default:
        logger.warn(`Unknown job name requested in email Queue: ${name}`);
    }
    logger.info(`Background email worker successfully completed job: ${name}`);
  } catch (error) {
    logger.error(`Error in email worker processing job '${name}': ${error.message}`);
    throw error; // Rethrow to let BullMQ trigger automatic retry parameters
  }
};

// Initialize Background Listener
const initEmailWorker = () => {
  if (isMock) {
    // Register the processor directly with the mock queue callback
    registerMockProcessor(processEmailJob);
    logger.info("BullMQ Email Worker registered in-memory mock handler.");
    return;
  }

  try {
    const worker = new Worker("emailQueue", processEmailJob, {
      connection: getBullMQConnection(),
      concurrency: 2, // Process up to 2 emails concurrently
    });

    worker.on("completed", (job) => {
      logger.info(`[BullMQ Worker] Completed email job ${job.id}`);
    });

    worker.on("failed", (job, err) => {
      logger.error(`[BullMQ Worker] Failed email job ${job?.id}: ${err.message}`);
    });

    logger.info("BullMQ Email Worker successfully listening on Redis channel.");
  } catch (err) {
    logger.error(`Failed to initialize BullMQ worker: ${err.message}`);
  }
};

initEmailWorker();

export default initEmailWorker;
