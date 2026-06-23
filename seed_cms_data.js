import "./src/config/env.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import logger from "./src/config/logger.js";
import Team from "./src/models/Team.js";
import Service from "./src/models/Service.js";
import Project from "./src/models/Project.js";
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

const servicesToSeed = [
  {
    title: "MERN Stack Development",
    shortDescription: "Complete full-stack engineering with high-performance real-time databases and server clusters.",
    detailedDescription: "We craft enterprise-ready, scale-to-millions systems using MongoDB, Express.js, React, and Node.js. Optimized for ultra-low latency, clean architectural patterns, structured APIs, and robust modular routing.",
    icon: "Database",
    features: [
      "Secured JWT / OAuth Auth flows",
      "Scalable NoSQL databases",
      "Robust RESTful and GraphQL APIs",
      "Real-time state synchronization via WebSockets",
      "Clustered Server architectures and load balancing"
    ],
    technologyStack: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "Redis"],
    status: "published",
    displayOrder: 1
  },
  {
    title: "Artificial Intelligence Solutions",
    shortDescription: "Custom LLMs, cognitive assistants, search-grounded chatbots, and advanced NLP automation layers.",
    detailedDescription: "Bridge the gap between business processes and smart autonomous action. We build real integration pipelines with model suites like Gemini, automate business tasks, and wire secure generative systems into your legacy databases.",
    icon: "BrainCircuit",
    features: [
      "Custom RAG (Retrieval-Augmented Generation) setups",
      "Smart text summaries & smart analytics pipelines",
      "Intelligent text-to-speech (TTS) and conversational systems",
      "Google Search & Maps grounded applications",
      "Autonomous AI workflows and schedule agent logic"
    ],
    technologyStack: ["Gemini API", "@google/genai", "Python", "Vector Databases", "LangChain"],
    status: "published",
    displayOrder: 2
  },
  {
    title: "SaaS Product Development",
    shortDescription: "Turn simple startup ideas into subscription platforms with secure billing, dashboards and analytics.",
    detailedDescription: "From your initial Minimum Viable Product (MVP) to full-scale cloud-native SaaS ecosystems, we establish everything. This includes billing models, customer profiles, permission structures, notifications, and analytics rails.",
    icon: "AppWindow",
    features: [
      "Structured Multi-school/Multi-tenant databases",
      "Stripe / Braintree secure merchant connections",
      "Stunning KPI dashboard reporting widgets",
      "Robust user seat invitations and team workspace controls",
      "Advanced usage telemetry track system"
    ],
    technologyStack: ["Next.js", "React", "Node.js", "Tailwind CSS", "Stripe", "Clerk"],
    status: "published",
    displayOrder: 3
  },
  {
    title: "Educational platforms & LMS",
    shortDescription: "Comprehensive school management portals, online mock exam solvers, and student tracking grids.",
    detailedDescription: "Transform modern classrooms. We build customized portals for multiple schools or competitive test-prep platforms (like MDCAT/AirForce/Army), integrating analytics, timers, mock exam grids, progress metrics, and secure remote student logins.",
    icon: "GraduationCap",
    features: [
      "High-concurrency online examination systems",
      "Smart adaptive student level trackers",
      "Automated homework grading and secure report sheets",
      "Institution administration controls and tuition ledger trackers",
      "Custom PDF certificate generation engine"
    ],
    technologyStack: ["Express", "MongoDB", "React", "Chart.js", "D3.js", "PDFKit"],
    status: "published",
    displayOrder: 4
  },
  {
    title: "Custom High-End Web Development",
    shortDescription: "High-converting corporate sites, lightning fast portfolios, and immersive marketing experiences.",
    detailedDescription: "We create pristine, fast-loading, highly optimized business sites engineered to convert visitors into clients. We avoid low-quality layouts, utilizing fluid typography, meticulous animations, and customized branding instead.",
    icon: "Globe",
    features: [
      "Perfect score lighthouse loading targets",
      "Fully responsive mobile-optimized bento layout grids",
      "Framer Motion layout transitions",
      "Server-side rendering (SSR) for powerful SEO presence",
      "Meticulous accessibility (WCAG) standard adaptation"
    ],
    technologyStack: ["HTML5 / CSS3", "Tailwind CSS", "Vite", "TypeScript", "Motion", "SEO Opt"],
    status: "published",
    displayOrder: 5
  },
  {
    title: "Slick UI/UX Design Prototyping",
    shortDescription: "Interactive design blueprints and customer journey optimization with visual feedback iterations.",
    detailedDescription: "Before writing a single line of code, our designers execute precise wireframes, high-fidelity mockups, and clickable mock prototypes in Figma, focusing strictly on target market retention parameters.",
    icon: "Figma",
    features: [
      "Client wireframe interactive layouts",
      "High-fidelity atomic component sheets",
      "High-contrast color styling systems",
      "User testing flows & usability evaluations",
      "Strict layout specifications handed directly to engineers"
    ],
    technologyStack: ["Figma", "Adobe CC", "Sketch", "Prototyping", "Design Systems"],
    status: "published",
    displayOrder: 6
  }
];

const projectsToSeed = [
  {
    projectName: "PrepForce AI",
    category: "ai",
    clientType: "Artificial Intelligence",
    tagline: "Dynamic Testing Platform for PMA, MDCAT, Air Force & Army Assessments",
    description: "PrepForce AI is a high-speed digital examining and learning system delivering adaptive mocks for military and competitive academic entries. Featuring AI evaluation of candidate flaws, automated score reporting, and a library of 50,000+ interactive test questions.",
    technologyStack: ["React.js", "Express", "Node.js", "MongoDB", "Gemini API", "Tailwind CSS"],
    features: [
      "Real-time stress-clock mock examination timers",
      "AI-driven instant mistake clustering reports",
      "Dynamic adaptive difficulties based on candidate metrics",
      "Comprehensive performance analytics panels"
    ],
    problem: "Handling thousands of parallel test submissions during peak hours without server delays or state losses.",
    solution: "Successfully supported preparation for over 12,000+ applicants with a verified test success increase of 37%.",
    images: ["https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://prepforce-ai.com",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Rizwan Ullah"]
  },
  {
    projectName: "Multi-School Educational LMS",
    category: "lms",
    clientType: "Educational Software",
    tagline: "Enterprise Management and Course Portal for Colleges & Multi-School Systems",
    description: "A comprehensive, cloud-native administration and study portal. It links administrative operations, automatic fee ledgers, exam reports, live homework grading modules, and private teacher-parent portals inside a robust, fast system.",
    technologyStack: ["React.js", "Express.js", "Node.js", "MongoDB Cluster", "Chart.js", "Tailwind"],
    features: [
      "Robust Multi-tenant school database segregation",
      "Automated fee transaction trackers and digital billing",
      "Slick parent-student real-time dashboard widgets",
      "Live assignments submitting and digital grading boards"
    ],
    problem: "Structuring private student files and institutional analytics in a secure manner while ensuring easy page navigation for children and non-technical staff.",
    solution: "Currently utilized by multiple regional educational institutes, managing over 8,500+ student profiles reliably.",
    images: ["https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://school-lms.com",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Farman Ullah Khan", "Mohsen Rehman"]
  },
  {
    projectName: "ForceReady AI",
    category: "ai",
    clientType: "Artificial Intelligence",
    tagline: "Simulated Interactive Speech Interview Trainer",
    description: "ForceReady AI is an interactive platform built for defense and interview preparation. Utilizing advanced voice and text analyzing prompts, it puts users through simulated interview panels, grading answer speed, vocabulary, confidence, and context accuracy.",
    technologyStack: ["React.js", "Express", "Google Speech API", "Gemini 3.5 Flash", "Node.js", "Tailwind CSS"],
    features: [
      "Vocal response capture and real-time transcription",
      "Realistic virtual interviewer panel audio cues",
      "Comprehensive visual grading panel scoring metrics",
      "Custom question plans based on target careers"
    ],
    problem: "Fine-tuning conversational prompts to adapt dynamically to diverse regional accents and speed patterns.",
    solution: "Provided preparation mock interviews for 3,400+ users, resulting in highly positive ratings from professional candidates.",
    images: ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://forceready-ai.com",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Irshad Ullah"]
  },
  {
    projectName: "Freelancing.pk",
    category: "web",
    clientType: "Web Platform",
    tagline: "Dedicated Freelancing and Business Services Multi-vendor Directory",
    description: "A large-scale directory and marketplace that connects Pakistani freelance talent with businesses. Supports secure payment options, detailed seller profile cards, interactive project folders, and direct live chats.",
    technologyStack: ["MERN Stack", "React", "Node.js", "Express", "Tailwind CSS", "MongoDB Cluster"],
    features: [
      "Advanced talent filters and tag matches",
      "Secure project posting and developer proposals portal",
      "Clean profile grids showcasing portfolio collections",
      "Slick integrated secure message panel"
    ],
    problem: "Constructing robust search filters that process complex categories instantly across thousands of digital profiles.",
    solution: "Created a centralized hub to display local freelance listings, aiding early digital service businesses.",
    images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://freelancing.pk",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Mati Ur Rehman"]
  },
  {
    projectName: "SaaS News Platform",
    category: "saas",
    clientType: "SaaS Application",
    tagline: "High-Volume Digital Publishing and Tech News Platform",
    description: "An automated publishing workspace designed for quick news distribution. Includes robust subscription plans, content recommendations based on reading history, instant rich text editor dashboards, and ad-management tracking boards.",
    technologyStack: ["React", "Express.js", "Node.js", "MongoDB", "Cloudflare CDN", "Stripe API"],
    features: [
      "Stripe payment integration for premium reading passes",
      "Rich web editor supporting draft versions and schedules",
      "Dynamic content feed sorting by trend score algorithms",
      "SEO-friendly automatic schema markup generation"
    ],
    problem: "Achieving high-speed image loads and layout stability under sudden traffic spikes from tech newsletter mentions.",
    solution: "Handles 150K+ monthly site visits with super fast page loads and optimized server consumption.",
    images: ["https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://saas-news.com",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Mohsen Rehman", "Muhammad Hadded"]
  },
  {
    projectName: "Restaurant Business Website",
    category: "web",
    clientType: "Custom Web App",
    tagline: "Immersive Elegant Digital Storefront for Fine Dining Business",
    description: "A beautiful, premium business website showcasing signature dishes, managing custom bookings, and enabling easy digital order placement. Features gorgeous visual animations and a seamless, high-performance checkout experience.",
    technologyStack: ["React", "Tailwind CSS", "Motion", "Express", "Node.js", "MongoDB"],
    features: [
      "Interactive 3D-feel product menu navigation with active filters",
      "Elegant real-time dining table calendar booking widget",
      "Interactive order desk dashboard tailored for kitchen staff",
      "Fluid page transitions and eye-safe twilight design presets"
    ],
    problem: "Balancing rich, beautiful food photograph files with fast, mobile-friendly data-saving requirements.",
    solution: "Reduced client tablebooking reservation delay logs by 65% and boosted direct takeaway checkouts significantly.",
    images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://client-restaurant.com",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Mohsen Rehman"]
  },
  {
    projectName: "MDCAT Online Testing Portal",
    category: "lms",
    clientType: "Educational Software",
    tagline: "High-Traffic Practice and Mock Portal for Medical Entrants",
    description: "Designed for high concurrency, this online portal serves medical aspirants preparing for MDCAT. It hosts biological, chemical, physical, and logical mock questions, keeping scores secure and generating instant test performance metrics.",
    technologyStack: ["React.js", "Express", "Node.js", "MongoDB", "Tailwind CSS", "Highcharts"],
    features: [
      "Sub-second answer evaluation pipeline",
      "Historical score trend graphs for students to analyze",
      "Auto-saving test state (restores upon network reconnect)",
      "Detailed step-by-step resolution breakdowns"
    ],
    problem: "Ensuring zero exam data loss even if the student's browser tab crashes or if their mobile network drops mid-test.",
    solution: "Stably supported parallel entry attempts of 1,500+ candidates simultaneously during statewide mock windows.",
    images: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800&h=500"],
    projectUrl: "https://mdcat-test.com",
    featuredProject: true,
    builtByType: "team",
    builtByNames: ["Mohsen Rehman"]
  }
];

const seedCmsData = async () => {
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
    logger.info("Connecting to MongoDB for CMS seeding operation...");
    await mongoose.connect(uri);

    // 4. Wipe collections
    logger.info("Wiping Team, Service, and Project collections...");
    await Team.deleteMany({});
    await Service.deleteMany({});
    await Project.deleteMany({});

    // 5. Seed Team members
    logger.info("Inserting team members to database...");
    const seededTeams = await Team.insertMany(teamMembersToSeed);
    logger.info(`Seeded ${seededTeams.length} team members.`);

    // Create lookup map of name -> _id
    const teamIdMap = {};
    seededTeams.forEach((t) => {
      teamIdMap[t.name.toLowerCase()] = t._id;
    });

    // 6. Seed Services
    logger.info("Inserting services to database...");
    const seededServices = await Service.insertMany(servicesToSeed);
    logger.info(`Seeded ${seededServices.length} services.`);

    // 7. Map projects attributions and seed
    logger.info("Mapping project attributions and preparing project records...");
    const mappedProjects = projectsToSeed.map((p) => {
      const builtByIds = [];
      if (Array.isArray(p.builtByNames)) {
        p.builtByNames.forEach((name) => {
          const id = teamIdMap[name.toLowerCase()];
          if (id) {
            builtByIds.push(id);
          } else {
            logger.warn(`Could not resolve team member ID for attribution: ${name}`);
          }
        });
      }

      // Create Mongoose project structure
      return {
        projectName: p.projectName,
        category: p.category,
        clientType: p.clientType,
        tagline: p.tagline,
        description: p.description,
        problem: p.problem,
        solution: p.solution,
        features: p.features,
        technologyStack: p.technologyStack,
        images: p.images,
        projectUrl: p.projectUrl,
        featuredProject: p.featuredProject,
        builtByType: p.builtByType,
        builtBy: builtByIds
      };
    });

    logger.info("Inserting projects to database...");
    const seededProjects = await Project.insertMany(mappedProjects);
    logger.info(`Seeded ${seededProjects.length} projects.`);

    // 8. Invalidate Redis Cache
    logger.info("Invalidating Redis caches...");
    await invalidateCache("cms:*");

    logger.info("CMS Database seeding successfully completed.");
  } catch (error) {
    logger.error(`CMS Database seeding failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
    process.exit(0);
  }
};

seedCmsData();
