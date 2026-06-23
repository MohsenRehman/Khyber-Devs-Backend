import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "",
    },
    photo: {
      type: String, // Client profile photo URL
      default: "",
    },
    review: {
      type: String,
      required: [true, "Review message content is required"],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    projectRelated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    featuredStatus: {
      type: Boolean,
      default: false,
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

// Soft Delete pre-query middleware
testimonialSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;
