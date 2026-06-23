import mongoose from "mongoose";

const candidateApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosition",
      required: [true, "Job position ID is required"],
    },
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Candidate email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String, // URL to PDF stored in Cloudinary/Disk
      required: [true, "Resume document link is required"],
    },
    portfolioLink: {
      type: String,
      default: "",
    },
    linkedIn: {
      type: String,
      default: "",
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["received", "reviewing", "interview_scheduled", "shortlisted", "rejected", "hired"],
      default: "received",
    },
    interviewNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const CandidateApplication = mongoose.model("CandidateApplication", candidateApplicationSchema);
export default CandidateApplication;
