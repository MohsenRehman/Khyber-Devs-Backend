import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String, // Rich text content (HTML string)
      required: true,
    },
    contentText: {
      type: String, // Plain text version for fuzzy search index
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    thumbnail: {
      type: String, // Cloudinary Image URL
      required: true,
    },
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    scheduledAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number, // in minutes
      default: 1,
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
blogSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Auto-calculate reading time and extract text before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const plainText = this.content.replace(/<[^>]*>/g, " ");
    this.contentText = plainText;
    
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.ceil(words / 200); // 200 words per minute average reading speed
  }
  next();
});

// Soft Delete pre-query middleware
blogSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
