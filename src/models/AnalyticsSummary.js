import mongoose from "mongoose";

const analyticsSummarySchema = new mongoose.Schema(
  {
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
      unique: true,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    countries: [
      {
        name: String,
        count: Number,
      },
    ],
    devices: [
      {
        name: String,
        count: Number,
      },
    ],
    browsers: [
      {
        name: String,
        count: Number,
      },
    ],
    conversions: {
      type: Number, // Number of leads generated
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const AnalyticsSummary = mongoose.model("AnalyticsSummary", analyticsSummarySchema);
export default AnalyticsSummary;
