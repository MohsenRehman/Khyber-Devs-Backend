import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.js";
import createLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// Strict rate limit for login attempts (15 attempts per 15 minutes per IP)
const authLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  "Too many authentication attempts from this IP. Please try again in 15 minutes."
);

// Public Auth Endpoints
router.post("/login", authLimiter, authController.login);
router.post("/refresh-token", authController.refresh);

// Protected Auth Endpoints
router.post("/logout", protect, authController.logout);
router.patch("/change-password", protect, authController.changePassword);

export default router;
