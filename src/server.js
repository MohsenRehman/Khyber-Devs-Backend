// ─── ENVIRONMENT MUST BE LOADED FIRST ────────────────────────────────────────
// env.js resolves the absolute path to .env before any other module reads process.env.
// This prevents MongoServerSelectionError / 500s caused by undefined MONGODB_URI.
import "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";

import { connectDB, closeDB } from "./config/db.js";
import logger from "./config/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import createLimiter from "./middlewares/rateLimiter.js";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import mediaRouter from "./routes/media.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import serviceRouter from "./routes/service.routes.js";
import teamRouter from "./routes/team.routes.js";
import projectRouter from "./routes/project.routes.js";
import testimonialRouter from "./routes/testimonial.routes.js";
import leadRouter from "./routes/lead.routes.js";
import careerRouter from "./routes/career.routes.js";
import blogRouter from "./routes/blog.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import sitemapRouter from "./routes/sitemap.routes.js";
import docsRouter from "./routes/docs.routes.js";
import trackVisitor from "./middlewares/analytics.js";
import auditLogger from "./middlewares/auditLogger.js";
import NotFoundError from "./errors/NotFoundError.js";
import Admin from "./models/Admin.js";
import Service from "./models/Service.js";
import Project from "./models/Project.js";
import Team from "./models/Team.js";
import JobPosition from "./models/JobPosition.js";
import Testimonial from "./models/Testimonial.js";
import {
  FALLBACK_SERVICES,
  FALLBACK_PROJECTS,
  FALLBACK_TEAM,
  FALLBACK_JOBS,
  FALLBACK_TESTIMONIALS
} from "./config/fallbacks.js";
import { invalidateCache } from "./utilities/cache.js";
import "./jobs/workers/emailWorker.js";
import "./jobs/analyticsJob.js";

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect Mongoose Database
connectDB();

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────

// 1. Helmet Security Headers (Includes HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "res.cloudinary.com", "cloudinary.com"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  "http://localhost:5173",
  "https://khyber-devs-frontend.vercel.app"
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// 3. Response Compression (Enables fast delivery over slow networks)
app.use(compression());

// 4. Request Body Parsers
app.use(express.json({ limit: "10kb" })); // Prevents large payload denial-of-service
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 5. Anti-NoSQL Query Injection (Sanitizes query keys starting with $ or .)
app.use(mongoSanitize());

// 6. Global Rate Limiting (Protects server from Denial-of-Service / brute-force)
const globalLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  150, // 150 requests per IP
  "Too many requests from this address. Please try again in 15 minutes."
);
app.use(globalLimiter);

// 7. Global Visitor Analytics Tracker
app.use(trackVisitor);

// 8. Global Admin Actions Audit Logger
app.use(auditLogger);

// ─── ROUTING ─────────────────────────────────────────────────────────────────

// Serve uploaded files statically from local uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount Health Check endpoint
app.use("/health", healthRouter);

// Base routing check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KHBER DEVS Enterprise System API Node active.",
  });
});

// v1 API Route Mount point
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/testimonials", testimonialRouter);
app.use("/api/v1/leads", leadRouter);
app.use("/api/v1/careers", careerRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/sitemap.xml", sitemapRouter);
app.use("/api-docs", docsRouter);

// 404 Route handler
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Requested path '${req.originalUrl}' not found on this server.`));
});

// Global Centralized Error Middleware
app.use(errorHandler);

// ─── SEED INITIAL ADMIN USER & DATABASE DATA ──────────────────────────────────

const seedAdminUser = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;

      if (email && password) {
        logger.info(`Auto-seeding initial Super Admin account: ${email}`);
        await Admin.create({
          name: "Super Admin",
          email,
          password,
          role: "superadmin",
          jobTitle: "Chief Technology Officer",
          status: "active",
        });
        logger.info("Auto-seeding successfully completed.");
      } else {
        logger.warn("Auto-seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in env variables.");
      }
    }
  } catch (err) {
    logger.error(`Error during initial Super Admin seeding: ${err.message}`);
  }
};

const seedAllData = async () => {
  if (process.env.SKIP_SEEDING === "true") {
    logger.info("Database auto-seeding skipped via SKIP_SEEDING setting.");
    return;
  }
  try {
    // 1. Seed Services if empty
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      logger.info("Auto-seeding initial Services data...");
      await Service.insertMany(FALLBACK_SERVICES);
      logger.info("Services auto-seeding completed.");
    }

    // 2. Seed Projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      logger.info("Auto-seeding initial Projects data...");
      await Project.insertMany(FALLBACK_PROJECTS);
      logger.info("Projects auto-seeding completed.");
    }

    // 3. Seed Team Members if empty
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      logger.info("Auto-seeding initial Team Members data...");
      await Team.insertMany(FALLBACK_TEAM);
      logger.info("Team Members auto-seeding completed.");
    }

    // 4. Seed Jobs if empty
    const jobCount = await JobPosition.countDocuments();
    if (jobCount === 0) {
      logger.info("Auto-seeding initial Job Positions data...");
      await JobPosition.insertMany(FALLBACK_JOBS);
      logger.info("Job Positions auto-seeding completed.");
    }

    // 5. Seed Testimonials if empty
    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      logger.info("Auto-seeding initial Testimonials data...");
      await Testimonial.insertMany(FALLBACK_TESTIMONIALS);
      logger.info("Testimonials auto-seeding completed.");
    }

    // Invalidate Redis caches to clear previous empty arrays
    await invalidateCache("cms:*");
    logger.info("Auto-seeding cache invalidation successfully completed.");
  } catch (err) {
    logger.error(`Error during initial database seeding: ${err.message}`);
  }
};

// Start Server & Listen (only if not in serverless Vercel context)
if (!process.env.VERCEL) {
  const server = app.listen(PORT, async () => {
    logger.info(`[KHBER DEVS] Server running under port ${PORT} in ${process.env.NODE_ENV} environment.`);
    await seedAdminUser();
    await seedAllData();
  });

  // ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────

  const shutdown = async (signal) => {
    logger.warn(`Received signal ${signal}. Shutting down Express server gracefully...`);

    server.close(async () => {
      logger.info("Express server closed.");
      await closeDB();
      logger.info("Graceful shutdown sequence completed.");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown triggered after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export default app;
