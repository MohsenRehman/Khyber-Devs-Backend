import express from "express";
import * as mediaController from "../controllers/media.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.js";

const router = express.Router();

// Apply session verification globally on all media endpoints
router.use(protect);

// GET /api/v1/media (View list of media metadata)
router.get("/", mediaController.getFiles);

// Mutating endpoints restricted to superadmin & admin roles
router.post(
  "/",
  restrictTo("superadmin", "admin"),
  uploadSingle("file"),
  mediaController.uploadFile
);

router.post(
  "/bulk",
  restrictTo("superadmin", "admin"),
  uploadMultiple("files", 10),
  mediaController.uploadFiles
);

router.delete(
  "/:id",
  restrictTo("superadmin", "admin"),
  mediaController.removeFile
);

export default router;
