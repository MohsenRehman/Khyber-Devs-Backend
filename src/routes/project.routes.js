import express from "express";
import * as projectController from "../controllers/project.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// Public read routes
router.get("/", projectController.getAllProjects);
router.get("/:slug", projectController.getProject);

// Mutating endpoints (Restricted to Super Admin & Admin)
router.post("/", protect, restrictTo("superadmin", "admin"), projectController.createProject);
router.put("/:id", protect, restrictTo("superadmin", "admin"), projectController.updateProject);
router.delete("/:id", protect, restrictTo("superadmin", "admin"), projectController.deleteProject);

export default router;
