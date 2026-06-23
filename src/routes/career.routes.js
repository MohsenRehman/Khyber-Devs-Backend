import express from "express";
import * as careerController from "../controllers/career.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { uploadSingle } from "../middlewares/upload.js";
import createLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// Apply anti-spam rate limiter on candidate application submissions (max 5 per 15 minutes per IP)
const applyLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many job applications submitted from this connection. Please try again in 15 minutes."
);

// ─── PUBLIC OPEN ENDPOINTS ───────────────────────────────────────────────────

// Read open positions
router.get("/jobs", careerController.getAllJobs);
router.get("/jobs/:slug", careerController.getJob);

// Submit application file with resume upload
router.post(
  "/apply",
  applyLimiter,
  uploadSingle("resume"), // expects form-data file key named 'resume'
  careerController.applyForJob
);

// ─── ADMIN RESTRICTED ENDPOINTS ───────────────────────────────────────────────

// CRUD operations on Job Positions
router.post("/jobs", protect, restrictTo("superadmin", "admin"), careerController.createJobPosition);
router.put("/jobs/:id", protect, restrictTo("superadmin", "admin"), careerController.updateJobPosition);
router.delete("/jobs/:id", protect, restrictTo("superadmin", "admin"), careerController.deleteJobPosition);

// Management of Candidate Applications
router.get("/applications", protect, restrictTo("superadmin", "admin"), careerController.getApplicationsList);
router.get("/applications/:id", protect, restrictTo("superadmin", "admin"), careerController.getApplicationDetails);
router.patch("/applications/:id/status", protect, restrictTo("superadmin", "admin"), careerController.changeApplicationStatus);

export default router;
