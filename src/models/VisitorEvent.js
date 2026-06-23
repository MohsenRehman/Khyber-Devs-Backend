import mongoose from "mongoose";

const visitorEventSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    deviceType: {
      type: String, // desktop, mobile, tablet
      default: "desktop",
    },
    browser: {
      type: String,
      default: "unknown",
    },
    country: {
      type: String,
      default: "PK", // default to Pakistan in local dev, parsed from headers in prod
    },
    referrer: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only record when event happened
  }
);

export const VisitorEvent = mongoose.model("VisitorEvent", visitorEventSchema);
export default VisitorEvent;
