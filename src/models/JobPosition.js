import mongoose from "mongoose";

const jobPositionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    department: {
      type: String, // e.g. Engineering, AI, Design, Sales
      required: true,
    },
    location: {
      type: String, // e.g. Peshawar, Pakistan / Remote
      required: true,
    },
    type: {
      type: String,
      enum: ["fulltime", "parttime", "contract", "remote", "internship"],
      default: "fulltime",
    },
    experienceRequired: {
      type: String, // e.g. '2+ Years'
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    salaryRange: {
      type: String,
      default: "Market Competitive",
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    displayOrder: {
      type: Number,
      default: 0,
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
jobPositionSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Soft Delete pre-query middleware
jobPositionSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const JobPosition = mongoose.model("JobPosition", jobPositionSchema);
export default JobPosition;
