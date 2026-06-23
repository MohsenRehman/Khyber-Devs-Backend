import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team member name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Team member role is required"],
      trim: true,
    },
    biography: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String, // e.g. '5 Years'
      default: "",
    },
    profileImage: {
      type: String,
      required: true,
    },
    profileImagePublicId: {
      type: String,
      default: "",
    },
    socialMediaLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    projects: {
      type: [
        {
          name: { type: String, required: true },
          link: { type: String, default: "" },
        }
      ],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
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
teamSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Team = mongoose.model("Team", teamSchema);
export default Team;
