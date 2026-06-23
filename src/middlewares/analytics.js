import { VisitorEvent } from "../models/VisitorEvent.js";
import logger from "../config/logger.js";

/**
 * Middleware to track raw visitor hits and page impressions
 */
export const trackVisitor = async (req, res, next) => {
  // Exclude static assets, health probes, and admin API calls from analytics
  const path = req.originalUrl;
  const isStatic = /\.(ico|png|jpg|jpeg|gif|css|js|svg|woff2)$/i.test(path);
  const isHealth = path.startsWith("/health");
  const isDocs = path.startsWith("/api-docs");

  // Exclude admin console requests (authenticated admin requests)
  const hasAuth = req.headers.authorization;
  const isAdminAPI = /^\/api\/v1\/(auth|media|settings|analytics)/i.test(path);

  // Exclude non-GET requests (mutations like status updates, note edits)
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);

  if (isStatic || isHealth || isDocs || hasAuth || isAdminAPI || isMutation) {
    return next();
  }

  // Trigger event collection asynchronously in the background so it never blocks the request loop
  setImmediate(async () => {
    try {
      const userAgent = req.headers["user-agent"] || "";
      const ipAddress = req.ip || req.connection.remoteAddress || "127.0.0.1";
      const referrer = req.headers["referer"] || req.headers["referrer"] || "";
      
      // Parse Country from standard Cloud hosting headers, fallback to PK
      const country = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || "PK";

      // Simple robust device parser
      let deviceType = "desktop";
      if (/mobi|android|iphone|ipod/i.test(userAgent)) {
        deviceType = "mobile";
      } else if (/ipad|tablet/i.test(userAgent)) {
        deviceType = "tablet";
      }

      // Simple browser parser
      let browser = "unknown";
      if (/chrome|crios/i.test(userAgent)) browser = "chrome";
      else if (/firefox|fxios/i.test(userAgent)) browser = "firefox";
      else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = "safari";
      else if (/edge|edg/i.test(userAgent)) browser = "edge";

      await VisitorEvent.create({
        ipAddress,
        path,
        userAgent,
        deviceType,
        browser,
        country: String(country).toUpperCase(),
        referrer,
      });
    } catch (error) {
      logger.error(`Visitor Analytics tracking failed: ${error.message}`);
    }
  });

  next();
};

export default trackVisitor;
