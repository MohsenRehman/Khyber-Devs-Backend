import express from "express";
import * as blogController from "../controllers/blog.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// Public open endpoints
router.get("/", blogController.getAllBlogs);
router.get("/:slug", blogController.getBlog);

// Admin restricted endpoints
router.post("/", protect, restrictTo("superadmin", "admin"), blogController.createBlog);
router.put("/:id", protect, restrictTo("superadmin", "admin"), blogController.updateBlog);
router.delete("/:id", protect, restrictTo("superadmin", "admin"), blogController.deleteBlog);

export default router;
