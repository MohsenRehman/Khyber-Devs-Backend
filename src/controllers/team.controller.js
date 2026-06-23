import * as teamService from "../services/team.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";
import BadRequestError from "../errors/BadRequestError.js";
import { isCloudinaryConfigured, cloudinary } from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import logger from "../config/logger.js";

export const getTeamList = async (req, res, next) => {
  try {
    const includeHidden = req.query.includeHidden === "true";
    const team = await teamService.getTeam(includeHidden);
    return sendSuccess(res, "Team members list retrieved successfully.", team);
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req, res, next) => {
  try {
    const member = await teamService.createTeamMember(req.body, req.user._id);
    return sendSuccess(res, "Team member added successfully.", member, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const member = await teamService.updateTeamMember(req.params.id, req.body, req.user._id);
    return sendSuccess(res, "Team member details updated successfully.", member);
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    await teamService.deleteTeamMember(req.params.id, req.user._id);
    return sendSuccess(res, "Team member profile deleted successfully.");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/team/upload-image
 * Uploads a profile image to Cloudinary (or local disk) and returns
 * the secure URL and publicId so the frontend can store them in the form.
 */
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("No image file provided. Please attach a profileImage field.");
    }

    let url;
    let publicId;

    if (isCloudinaryConfigured) {
      // multer-storage-cloudinary stores the secure URL in file.path
      url = req.file.path;
      publicId = req.file.filename;
    } else {
      // Local disk fallback
      url = `/uploads/${req.file.filename}`;
      publicId = req.file.filename;
    }

    return sendSuccess(res, "Profile image uploaded successfully.", { url, publicId }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/team/image
 * Deletes an image from Cloudinary (or local disk) by its publicId.
 * Body: { publicId: string }
 * Does NOT delete the team member record — only the raw asset.
 */
export const deleteProfileImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      throw new BadRequestError("publicId is required to identify the image asset.");
    }

    if (isCloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        logger.error(`Cloudinary image delete failed: ${err.message}`);
      }
    } else {
      // Local disk fallback — remove file by filename
      const localFilePath = path.join(process.cwd(), "uploads", publicId);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (err) {
          logger.error(`Local file delete failed: ${err.message}`);
        }
      }
    }

    return sendSuccess(res, "Profile image removed from storage successfully.", { publicId });
  } catch (error) {
    next(error);
  }
};
