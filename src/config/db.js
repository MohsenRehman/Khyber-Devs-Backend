import mongoose from "mongoose";
import logger from "./logger.js";

const dbOptions = {
  autoIndex: true, // Enable auto-indexing for fast queries in dev (should be managed in prod, but standard)
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close double-inactive sockets after 45 seconds
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error("FATAL ERROR: MONGODB_URI is not defined in env variables.");
    process.exit(1);
  }

  // Setup event listeners
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB cluster connection successfully established.");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB cluster connection lost. Attempting reconnect...");
  });

  try {
    await mongoose.connect(uri, dbOptions);
  } catch (error) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    // Do not crash the entire process. Let the server stay online and let health check endpoints report status.
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection pool closed successfully.");
  } catch (error) {
    logger.error(`Error closing MongoDB pool: ${error}`);
  }
};

export default connectDB;
