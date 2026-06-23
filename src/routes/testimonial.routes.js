import express from "express";
import * as testimonialController from "../controllers/testimonial.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// Public read routes
router.get("/", testimonialController.getAllTestimonials);

// Mutating endpoints (Restricted to Super Admin & Admin)
router.post("/", protect, restrictTo("superadmin", "admin"), testimonialController.createTestimonial);
router.put("/:id", protect, restrictTo("superadmin", "admin"), testimonialController.updateTestimonial);
router.delete("/:id", protect, restrictTo("superadmin", "admin"), testimonialController.deleteTestimonial);

export default router;
