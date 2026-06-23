import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "KHBER DEVS",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    faviconUrl: {
      type: String,
      default: "",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    contactEmails: {
      type: [String],
      default: ["rehmanmohsen31@gmail.com"],
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      instagram: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    googleAnalyticsId: {
      type: String,
      default: "",
    },
    defaultSEO: {
      metaTitle: { type: String, default: "KHBER DEVS | Enterprise MERN & AI Solutions" },
      metaDescription: { type: String, default: "Enterprise MERN stack web applications and custom artificial intelligence layers engineered by experts." },
      metaKeywords: { type: String, default: "software house, web development, MERN stack, AI integration, SaaS" },
      ogImageUrl: { type: String, default: "" },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
