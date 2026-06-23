import express from "express";
import { getHealth, getDetailedHealth } from "../controllers/health.controller.js";

const router = express.Router();

// GET /health
router.get("/", getHealth);

// GET /health/detailed
router.get("/detailed", getDetailedHealth);

export default router;
