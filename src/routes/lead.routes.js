import express from "express";
import * as leadController from "../controllers/lead.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import createLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// Anti-spam rate limiter for public contact submissions (max 5 per 15 minutes per IP)
const leadFormLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many lead submissions from this connection. Please try again in 15 minutes."
);

// Public submission route
router.post("/", leadFormLimiter, leadController.submitLead);

// Protected routes (Super Admin / Admin / Viewer access)
router.get("/", protect, leadController.getLeadsList);
router.get("/:id", protect, leadController.getLeadDetails);

// Mutating admin endpoints restricted to superadmin & admin
router.patch("/:id/status", protect, restrictTo("superadmin", "admin"), leadController.changeLeadStatus);
router.post("/:id/notes", protect, restrictTo("superadmin", "admin"), leadController.appendLeadNote);
router.post("/:id/respond", protect, restrictTo("superadmin", "admin"), leadController.replyToLead);
router.delete("/:id/notes/:noteId", protect, restrictTo("superadmin", "admin"), leadController.removeLeadNote);

export default router;
