import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";

let isCloudinaryConfigured = false;

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === "mock_cloud_name") {
    logger.warn("Cloudinary credentials not configured or using mock keys. Local disk storage fallback active.");
    return;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    isCloudinaryConfigured = true;
    logger.info("Cloudinary media service configured successfully.");
  } catch (error) {
    logger.error(`Failed to configure Cloudinary: ${error.message}`);
  }
};

configureCloudinary();

export { cloudinary, isCloudinaryConfigured };
export default cloudinary;
