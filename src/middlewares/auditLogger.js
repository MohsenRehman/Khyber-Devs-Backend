import AuditLog from "../models/AuditLog.js";
import logger from "../config/logger.js";

/**
 * Middleware to audit admin data mutations (POST, PUT, PATCH, DELETE)
 */
export const auditLogger = async (req, res, next) => {
  // Catch finish event of response to log outcome
  res.on("finish", async () => {
    // Only audit write operations and authenticated admins
    if (req.method !== "GET" && req.user && res.statusCode >= 200 && res.statusCode < 400) {
      try {
        // Sanitize sensitive body fields before saving to audit logs
        const sanitizedBody = { ...req.body };
        const sensitiveKeys = ["password", "token", "secret", "oldPassword", "newPassword", "twofaSecret"];
        
        for (const key of sensitiveKeys) {
          if (sanitizedBody[key]) {
            sanitizedBody[key] = "[REDACTED]";
          }
        }

        await AuditLog.create({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: `${req.method} ${req.originalUrl}`,
          method: req.method,
          route: req.originalUrl,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
          details: {
            body: sanitizedBody,
            params: req.params,
            query: req.query,
            statusCode: res.statusCode,
          },
        });
      } catch (error) {
        logger.error(`Failed to write Audit Log entry: ${error.message}`);
      }
    }
  });

  next();
};

export default auditLogger;
