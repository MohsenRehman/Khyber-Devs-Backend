import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/v1/analytics/stats (Restricted to all authenticated Admin roles)
router.get("/stats", protect, restrictTo("superadmin", "admin", "viewer"), analyticsController.getStatsSummary);

export default router;
