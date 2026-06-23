import express from "express";
import * as serviceController from "../controllers/service.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// Public read routes
router.get("/", serviceController.getAllServices);
router.get("/:slug", serviceController.getService);

// Mutating endpoints (Restricted to Super Admin & Admin)
router.post("/", protect, restrictTo("superadmin", "admin"), serviceController.createService);
router.put("/:id", protect, restrictTo("superadmin", "admin"), serviceController.updateService);
router.delete("/:id", protect, restrictTo("superadmin", "admin"), serviceController.deleteService);

export default router;
