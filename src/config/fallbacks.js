export const FALLBACK_SERVICES = [
  {
    title: "MERN Stack Development",
    slug: "mern-stack-development",
    shortDescription: "Complete full-stack engineering with high-performance real-time databases and server clusters.",
    detailedDescription: "We craft enterprise-ready, scale-to-millions systems using MongoDB, Express.js, React, and Node.js. Optimized for ultra-low latency, clean architectural patterns, structured APIs, and robust modular routing.",
    icon: "Database",
    features: [
      "Secured JWT / OAuth Auth flows",
      "Scalable NoSQL databases",
      "Robust RESTful and GraphQL APIs"
    ],
    technologyStack: ["React", "Node.js", "Express.js", "MongoDB"],
    status: "published"
  },
  {
    title: "Artificial Intelligence Solutions",
    slug: "artificial-intelligence-solutions",
    shortDescription: "Custom LLMs, cognitive assistants, search-grounded chatbots, and advanced NLP automation layers.",
    detailedDescription: "Bridge the gap between business processes and smart autonomous action. We build real integration pipelines with model suites like Gemini, automate business tasks, and wire secure generative systems into your legacy databases.",
    icon: "BrainCircuit",
    features: [
      "Custom RAG (Retrieval-Augmented Generation) setups",
      "Smart text summaries & analytics pipelines",
      "Google Search & Maps grounded applications"
    ],
    technologyStack: ["Gemini API", "Python", "Vector Databases"],
    status: "published"
  },
  {
    title: "SaaS Product Development",
    slug: "saas-product-development",
    shortDescription: "Turn simple startup ideas into subscription platforms with secure billing, dashboards and analytics.",
    detailedDescription: "From your initial Minimum Viable Product (MVP) to full-scale cloud-native SaaS ecosystems, we establish everything. This includes billing models, customer profiles, permission structures, notifications, and analytics rails.",
    icon: "AppWindow",
    features: [
      "Structured Multi-tenant databases",
      "Stripe / Credit Card Secure Payment gateways",
      "Slick user workspace controls"
    ],
    technologyStack: ["Next.js", "React", "Node.js", "Stripe"],
    status: "published"
  }
];

export const FALLBACK_PROJECTS = [
  {
    projectName: "PrepForce AI",
    slug: "prepforce-ai",
    category: "ai",
    clientType: "Artificial Intelligence",
    description: "PrepForce AI is a high-speed digital examining and learning system delivering adaptive mocks for military and competitive academic entries.",
    problem: "Handling thousands of parallel test submissions during peak hours without server delays or state losses.",
    solution: "Successfully supported preparation for over 12,000+ applicants with a verified test success increase of 37%.",
    features: [
      "Real-time stress-clock mock examination timers",
      "AI-driven instant mistake clustering reports"
    ],
    technologyStack: ["React.js", "Express", "Node.js", "MongoDB", "Gemini API"],
    images: ["https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&q=80&w=800&h=500"],
    featuredProject: true
  },
  {
    projectName: "Multi-School Educational LMS",
    slug: "multi-school-educational-lms",
    category: "lms",
    clientType: "Educational Software",
    description: "A comprehensive, cloud-native administration and study portal. It links administrative operations, automatic fee ledgers, exam reports, and private teacher-parent portals.",
    problem: "Structuring private student files and institutional analytics in a secure manner while ensuring easy page navigation.",
    solution: "Currently utilized by multiple regional educational institutes, managing over 8,500+ student profiles reliably.",
    features: [
      "Robust Multi-tenant school database segregation",
      "Automated fee transaction trackers and digital billing"
    ],
    technologyStack: ["React.js", "Express.js", "Node.js", "MongoDB Cluster"],
    images: ["https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800&h=500"],
    featuredProject: false
  }
];

export const FALLBACK_TEAM = [
  {
    name: "Mohsen Rehman",
    role: "Founder & Full Stack MERN Developer",
    biography: "Passionate software engineer and lead designer with years of experience building high-performance SaaS. Mohsen has established KHBER DEVS to offer startups worldwide top-tier technical capability, premium styling, and clean coding architectures.",
    skills: ["MERN Stack", "SaaS Architecture", "REST APIs", "Modern UI Development"],
    experience: "5+ Years Commercial Experience",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400",
    socialMediaLinks: {
      github: "#",
      linkedin: "#"
    },
    projects: [
      { name: "SaaS News Platform", link: "https://saas-news.com" },
      { name: "MDCAT Online Testing System", link: "https://mdcat-test.com" },
      { name: "Client Restaurant Website", link: "https://client-restaurant.com" }
    ]
  },
  {
    name: "Farman Ullah Khan",
    role: "Full Stack Developer",
    biography: "Educational engineering specialist. Farman leads development of school portfolios and college database synchronizations. He excels in managing massive parallel systems and building custom student analytics dashboards.",
    skills: ["Educational Platforms", "Dashboard Systems", "Database Management", "Express & React"],
    experience: "4+ Years Software Development",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400",
    socialMediaLinks: {
      github: "#",
      linkedin: "#"
    },
    projects: [
      { name: "Multi-School & College LMS", link: "https://school-lms.com" }
    ]
  }
];

export const FALLBACK_JOBS = [
  {
    title: "Senior MERN Stack Engineer (AI-Focus)",
    slug: "senior-mern-stack-engineer-ai-focus",
    department: "Engineering",
    location: "Remote or Hybrid (Peshawar Tech-Circle)",
    type: "fulltime",
    experienceRequired: "3+ Years commercial MERN Dev",
    requirements: [
      "Excellent skill with Node.js, Express, React, and MongoDB optimizations",
      "Demonstrable experience integrating Gemini API or other Generative SDKs",
      "Solid knowledge of TypeScript, schema design, and secure API structures"
    ],
    salaryRange: "$1000 — $1800 / Mo",
    status: "published"
  },
  {
    title: "Slick Frontend & React Designer",
    slug: "slick-frontend-react-designer",
    department: "Creative & UI/UX",
    location: "Remote",
    type: "fulltime",
    experienceRequired: "2+ Years web layout development",
    requirements: [
      "Stellar ability to write clean modern React components styled with Tailwind CSS",
      "Experience with Motion layout animations and complex interactions",
      "Expert knowledge of Figma handoffs"
    ],
    salaryRange: "$700 — $1200 / Mo",
    status: "published"
  }
];

export const FALLBACK_TESTIMONIALS = [
  {
    clientName: "Imran Siddiqui",
    company: "Future Prep Academic Alliance",
    review: "KHBER DEVS transformed our manual question filing into a spectacular online system. Rizwan and Mohsen built modular code that stably processes thousands of simulations each hour.",
    rating: 5,
    featuredStatus: true
  },
  {
    clientName: "Sarah Jenkins",
    company: "SaaS Pulse Media",
    review: "The MERN stack expertise at KHBER DEVS is absolute master-class. They built our tech news portal with sub-second lazy-loading, optimized Mongo clusters, and a beautiful sleek dark visual interface.",
    rating: 5,
    featuredStatus: true
  }
];
