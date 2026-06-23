import "./src/config/env.js";
import mongoose from "mongoose";
import logger from "./src/config/logger.js";
import Service from "./src/models/Service.js";
import Project from "./src/models/Project.js";
import Team from "./src/models/Team.js";
import JobPosition from "./src/models/JobPosition.js";
import Testimonial from "./src/models/Testimonial.js";
import Lead from "./src/models/Lead.js";
import CandidateApplication from "./src/models/CandidateApplication.js";
import VisitorEvent from "./src/models/VisitorEvent.js";
import AnalyticsSummary from "./src/models/AnalyticsSummary.js";
import { invalidateCache } from "./src/utilities/cache.js";

const resetDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error("MONGODB_URI is not defined.");
    process.exit(1);
  }

  try {
    logger.info("Connecting to MongoDB for reset operation...");
    await mongoose.connect(uri);

    logger.info("Wiping Analytics & Visitor logs...");
    await VisitorEvent.deleteMany({});
    await AnalyticsSummary.deleteMany({});

    logger.info("Wiping CMS Mockup Selections (Services, Projects, Team, Jobs, Testimonials)...");
    await Service.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await JobPosition.deleteMany({});
    await Testimonial.deleteMany({});

    logger.info("Wiping pipeline leads & applications...");
    await Lead.deleteMany({});
    await CandidateApplication.deleteMany({});

    logger.info("Invalidating Redis caches...");
    await invalidateCache("cms:*");

    logger.info("Database reset completed successfully! All mockup/developer records have been wiped clean.");
  } catch (error) {
    logger.error(`Database reset failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
    process.exit(0);
  }
};

resetDatabase();
