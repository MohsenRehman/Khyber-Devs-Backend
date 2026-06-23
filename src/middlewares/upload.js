import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";
import { isCloudinaryConfigured, cloudinary } from "../config/cloudinary.js";
import logger from "../config/logger.js";
import BadRequestError from "../errors/BadRequestError.js";

// Ensure local uploads directory exists for disk storage fallback
const localUploadsDir = path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }
} catch (error) {
  // Fail-safe for read-only environments like Vercel serverless.
  // Fallback upload uses Cloudinary when configured correctly.
  logger.warn(`Could not check/create local uploads folder: ${error.message}. This is normal on read-only serverless filesystems.`);
}

// ─── FILTERS & LIMITS ────────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  return cb(new BadRequestError("Invalid file format. Allowed: Images (jpg/png/webp) or Documents (pdf/doc)"), false);
};

// ─── STORAGE CONFIGURATIONS ──────────────────────────────────────────────────

// 1. Cloudinary Storage (Direct Stream Upload)
const getCloudinaryStorage = () => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Determine folder dynamically from request body, defaults to 'Company'
      const folderName = req.body.folder || "Company";
      const format = path.extname(file.originalname).replace(".", "") || "png";
      
      return {
        folder: `KHBER-DEVS/${folderName}`,
        format: format,
        public_id: `${Date.now()}-${file.originalname.split(".")[0].replace(/[^a-zA-Z0-5]/g, "_")}`,
        transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
      };
    },
  });
};

// 2. Local Disk Storage (Fallback for development/offline testing)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Initialize Multer dynamically based on Cloudinary connection status
const getMulterConfig = () => {
  const storage = isCloudinaryConfigured ? getCloudinaryStorage() : diskStorage;
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max limit
    },
  });
};

// Export Multer Upload Interfaces
export const uploadSingle = (fieldName) => (req, res, next) => {
  const upload = getMulterConfig().single(fieldName);
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new BadRequestError(`Multer upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

export const uploadMultiple = (fieldName, maxCount = 5) => (req, res, next) => {
  const upload = getMulterConfig().array(fieldName, maxCount);
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new BadRequestError(`Multer upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};
