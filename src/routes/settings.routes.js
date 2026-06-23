import express from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/v1/settings (Public - read settings)
router.get("/", settingsController.getSettings);

// PUT /api/v1/settings (Restricted to Super Admin)
router.put("/", protect, restrictTo("superadmin"), settingsController.updateSettings);

export default router;
