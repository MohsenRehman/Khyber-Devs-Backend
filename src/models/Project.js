import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String, // e.g. SaaS, AI, Mobile App, LMS
      required: true,
    },
    clientType: {
      type: String, // e.g. Enterprise, Startup, Education
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      trim: true,
    },
    solution: {
      type: String,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    technologyStack: {
      type: [String],
      default: [],
    },
    images: {
      type: [String], // Array of Cloudinary Image URLs
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    projectUrl: {
      type: String,
      default: "",
    },
    gitHubUrl: {
      type: String,
      default: "",
    },
    completionDate: {
      type: Date,
    },
    projectStatus: {
      type: String,
      enum: ["finished", "in_development", "on_hold"],
      default: "finished",
    },
    featuredProject: {
      type: Boolean,
      default: false,
    },
    // ── Who built this project ────────────────────────────────────────────
    builtByType: {
      type: String,
      enum: ["company", "team"],
      default: "company", // 'company' = KHBER DEVS as a whole; 'team' = specific members
    },
    builtBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Slug auto-generation
projectSchema.pre("validate", function (next) {
  if (this.projectName && !this.slug) {
    this.slug = this.projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Soft Delete pre-query middleware
projectSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Project = mongoose.model("Project", projectSchema);
export default Project;
