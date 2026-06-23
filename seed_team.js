import "./src/config/env.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import logger from "./src/config/logger.js";
import Team from "./src/models/Team.js";
import { invalidateCache } from "./src/utilities/cache.js";

const teamMembersToSeed = [
  {
    name: "Mohsen Rehman",
    role: "Founder & Full Stack MERN Developer",
    biography: "Passionate software engineer and lead designer with years of experience building high-performance SaaS. Mohsen has established KHBER DEVS to offer startups worldwide top-tier technical capability, premium styling, and clean coding architectures.",
    skills: ["MERN Stack", "SaaS Architecture", "REST APIs", "Database Design", "Modern UI Development"],
    experience: "5+ Years Commercial Experience",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400",
    profileImagePublicId: "",
    socialMediaLinks: {
      github: "#",
      linkedin: "#",
      twitter: ""
    },
    projects: [
      { name: "SaaS News Platform", link: "#" },
      { name: "MDCAT Online Testing System", link: "#" },
      { name: "Client Restaurant Website", link: "#" }
    ],
    displayOrder: 1,
    featuredStatus: true
  },
  {
    name: "Farman Ullah Khan",
    role: "Full Stack Developer",
    biography: "Educational engineering specialist. Farman leads development of school portfolios and college database synchronizations. He excels in managing massive parallel systems and building custom student analytics dashboards.",
    skills: ["Educational Platforms", "Dashboard Systems", "Database Management", "Express & React"],
    experience: "4+ Years Software Development",
    profileImage: "/uploads/farman_ullah_profile_1781761470944.jpg",
    profileImagePublicId: "farman_ullah_profile_1781761470944.jpg",
    socialMediaLinks: {
      github: "#",
      linkedin: "#",
      twitter: ""
    },
    projects: [
      { name: "Multi-School & College LMS", link: "#" }
    ],
    displayOrder: 2,
    featuredStatus: true
  },
  {
    name: "Rizwan Ullah",
    role: "AI & Full Stack Developer",
    biography: "AI platform engineer with a heavy focus on intelligent test-simulation loops. Rizwan bridges the gap between deep knowledge assessments and machine learning pipelines, ensuring robust testing security.",
    skills: ["AI Integration", "PrepForce Suite", "Competitive Exams Code", "Node.js optimization"],
    experience: "3+ Years AI & Web Dev",
    profileImage: "/uploads/rizwan_ullah_profile_1781761328046.jpg",
    profileImagePublicId: "rizwan_ullah_profile_1781761328046.jpg",
    socialMediaLinks: {
      github: "#",
      linkedin: "#",
      twitter: ""
    },
    projects: [
      { name: "PrepForce AI Platform", link: "#" }
    ],
    displayOrder: 3,
    featuredStatus: true
  },
  {
    name: "Irshad Ullah",
    role: "AI Developer",
    biography: "Irshad specializes in large language model (LLM) fine-tuning and natural language voice interactions. His core creation, ForceReady AI, guides users through simulated real-time interview scenarios with visual scoring feedback.",
    skills: ["Artificial Intelligence", "Large Language Models", "Conversational UX", "ForceReady Core"],
    experience: "3+ Years LLM Custom Integration",
    profileImage: "/uploads/irshad_ullah_1781760846311.jpg",
    profileImagePublicId: "irshad_ullah_1781760846311.jpg",
    socialMediaLinks: {
      github: "#",
      linkedin: "",
      twitter: ""
    },
    projects: [
      { name: "ForceReady AI Tool", link: "#" }
    ],
    displayOrder: 4,
    featuredStatus: true
  },
  {
    name: "Mati Ur Rehman",
    role: "Web Developer & Entrepreneur",
    biography: "Corporate technology builder and digital startup founder. Mati connects tech requirements with strategic client outcomes, driving freelancing structures and client business automation setups.",
    skills: ["Digital Ecosystems", "Startup Strategy", "E-Commerce", "Custom Web Development"],
    experience: "4+ Years Web & Business Solutions",
    profileImage: "/uploads/mati_ur_rehman_1781761044796.jpg",
    profileImagePublicId: "mati_ur_rehman_1781761044796.jpg",
    socialMediaLinks: {
      github: "",
      linkedin: "#",
      twitter: ""
    },
    projects: [
      { name: "Freelancing.pk Platform", link: "#" }
    ],
    displayOrder: 5,
    featuredStatus: true
  },
  {
    name: "Muhammad Hadded",
    role: "Software Developer",
    biography: "UI researcher and frontend performance specialist. Muhammad is dedicated to refining high-speed browser delivery, clean code refactored bundles, and establishing custom CSS structures.",
    skills: ["React State", "Tailwind Magic", "Browser Performance", "Type-safe Frontends"],
    experience: "2+ Years Technical Exploration",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400",
    profileImagePublicId: "",
    socialMediaLinks: {
      github: "#",
      linkedin: "",
      twitter: ""
    },
    projects: [
      { name: "Modern Corporate Landing Suites", link: "#" }
    ],
    displayOrder: 6,
    featuredStatus: true
  }
];

const seedTeam = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error("MONGODB_URI is not defined.");
    process.exit(1);
  }

  try {
    // 1. Ensure uploads directory exists in backend
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      logger.info(`Creating backend uploads directory at: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 2. Copy images from Frontend to Backend
    const frontendImagesDir = path.join(process.cwd(), "../Frontend/src/assets/images");
    const imageFilesToCopy = [
      "farman_ullah_profile_1781761470944.jpg",
      "rizwan_ullah_profile_1781761328046.jpg",
      "irshad_ullah_1781760846311.jpg",
      "mati_ur_rehman_1781761044796.jpg"
    ];

    if (fs.existsSync(frontendImagesDir)) {
      imageFilesToCopy.forEach((filename) => {
        const srcPath = path.join(frontendImagesDir, filename);
        const destPath = path.join(uploadsDir, filename);
        if (fs.existsSync(srcPath)) {
          logger.info(`Copying profile image: ${filename} -> backend/uploads/`);
          fs.copyFileSync(srcPath, destPath);
        } else {
          logger.warn(`Source image not found in Frontend assets: ${srcPath}`);
        }
      });
    } else {
      logger.warn(`Frontend images directory not found at: ${frontendImagesDir}. Skipping image copies.`);
    }

    // 3. Connect to MongoDB
    logger.info("Connecting to MongoDB for seeding operation...");
    await mongoose.connect(uri);

    // 4. Wipe existing Team collection to avoid duplicates
    logger.info("Wiping existing team member records...");
    await Team.deleteMany({});

    // 5. Seed the Team collection
    logger.info("Inserting team members to database...");
    await Team.insertMany(teamMembersToSeed);
    logger.info("Team members seeded successfully!");

    // 6. Invalidate caches
    logger.info("Invalidating Redis caches...");
    await invalidateCache("cms:*");

    logger.info("Database seeding successfully completed.");
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
    process.exit(0);
  }
};

seedTeam();
