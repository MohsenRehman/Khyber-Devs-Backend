import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    projectType: {
      type: String,
      required: true,
    },
    budgetRange: {
      type: String,
      default: "",
    },
    expectedTimeline: {
      type: String,
      default: "",
    },
    requirements: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "website_form", // website_form, calculator, chatbot
    },
    status: {
      type: String,
      enum: ["new", "contacted", "meeting_scheduled", "proposal_sent", "negotiation", "won", "lost"],
      default: "new",
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    priorityLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notes: [
      {
        text: String,
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    utm_source: { type: String, default: "" },
    utm_medium: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
