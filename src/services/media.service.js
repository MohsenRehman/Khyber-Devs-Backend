import fs from "fs";
import path from "path";
import Media from "../models/Media.js";
import { isCloudinaryConfigured, cloudinary } from "../config/cloudinary.js";
import logger from "../config/logger.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";

/**
 * Saves uploaded file information into the database.
 * Supports both Cloudinary streaming and Disk storage.
 */
export const saveMediaInfo = async (file, adminId, folderName) => {
  if (!file) {
    throw new BadRequestError("No file upload payload detected.");
  }

  let url;
  let publicId;

  if (isCloudinaryConfigured) {
    // Cloudinary properties
    url = file.path; // Secure URL returned by multer-storage-cloudinary
    publicId = file.filename; // Public ID containing folder prefix
  } else {
    // Local Disk properties
    url = `/uploads/${file.filename}`;
    publicId = file.filename;
  }

  const mediaDoc = await Media.create({
    fileName: file.originalname,
    url: url,
    publicId: publicId,
    type: file.mimetype,
    size: file.size,
    uploadedBy: adminId,
    folder: folderName || "Company",
  });

  return mediaDoc;
};

/**
 * Retrieves paginated media library meta-data.
 */
export const listMedia = async (page = 1, limit = 20, folderName) => {
  const query = {};
  if (folderName) {
    query.folder = folderName;
  }

  const skip = (page - 1) * limit;

  const files = await Media.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("uploadedBy", "name email");

  const total = await Media.countDocuments(query);

  return {
    files,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Removes file from storage (Cloudinary or local disk) and sets soft-delete status.
 */
export const deleteMedia = async (mediaId, adminId) => {
  const media = await Media.findById(mediaId);
  if (!media) {
    throw new NotFoundError("Media record not found in the library.");
  }

  // 1. Delete actual file from physical storage
  if (isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(media.publicId);
    } catch (err) {
      logger.error(`Failed to delete Cloudinary file: ${err.message}`);
    }
  } else {
    // Local File delete
    const localFilePath = path.join(process.cwd(), "uploads", media.publicId);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        logger.error(`Failed to delete local disk file: ${err.message}`);
      }
    }
  }

  // 2. Perform Soft Delete in MongoDB
  media.isDeleted = true;
  media.deletedAt = new Date();
  media.deletedBy = adminId;

  await media.save();
  return media;
};
