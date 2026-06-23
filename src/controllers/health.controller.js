import mongoose from "mongoose";
import redisClient, { isMock } from "../config/redis.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

/**
 * Basic health check (used by load balancers, container orchestrators, UptimeRobot)
 */
export const getHealth = (req, res) => {
  return sendSuccess(res, "Server is operational", { uptime: process.uptime() });
};

/**
 * Detailed diagnostics health check
 */
export const getDetailedHealth = async (req, res) => {
  const dbStatusMap = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbStatusMap[dbState] || "Unknown";

  let redisStatus = "Disconnected";
  if (isMock) {
    redisStatus = "Mock (Fallback Active)";
  } else {
    try {
      const pingResult = await redisClient.ping();
      if (pingResult === "PONG") {
        redisStatus = "Connected";
      }
    } catch (err) {
      redisStatus = `Error: ${err.message}`;
    }
  }

  const memoryUsage = process.memoryUsage();

  const diagnostics = {
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStatus,
      stateCode: dbState,
    },
    redis: {
      status: redisStatus,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    },
  };

  const isHealthy = dbState === 1 && (isMock || redisStatus === "Connected");
  
  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? "All system components healthy" : "System degraded",
    data: diagnostics,
  });
};
