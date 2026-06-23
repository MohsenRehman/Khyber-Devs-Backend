import express from "express";
import * as teamController from "../controllers/team.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { uploadSingle } from "../middlewares/upload.js";

const router = express.Router();

// Public read routes
router.get("/", teamController.getTeamList);

// Mutating endpoints (Restricted to Super Admin & Admin)
router.post("/", protect, restrictTo("superadmin", "admin"), teamController.createMember);
router.put("/:id", protect, restrictTo("superadmin", "admin"), teamController.updateMember);
router.delete("/:id", protect, restrictTo("superadmin", "admin"), teamController.deleteMember);

// Profile image upload — returns Cloudinary URL + publicId
router.post(
  "/upload-image",
  protect,
  restrictTo("superadmin", "admin"),
  uploadSingle("profileImage"),
  teamController.uploadProfileImage
);

// Delete a profile image from Cloudinary by publicId (does NOT delete the team member)
router.delete(
  "/image",
  protect,
  restrictTo("superadmin", "admin"),
  teamController.deleteProfileImage
);

export default router;
