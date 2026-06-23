import * as careerService from "../services/career.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";
import { isCloudinaryConfigured } from "../config/cloudinary.js";
import BadRequestError from "../errors/BadRequestError.js";

// ─── JOB POSITIONS CONTROLLERS ────────────────────────────────────────────────

export const getAllJobs = async (req, res, next) => {
  try {
    const includeDrafts = req.query.includeDrafts === "true";
    const jobs = await careerService.getJobs(includeDrafts);
    return sendSuccess(res, "Job positions retrieved successfully.", jobs);
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req, res, next) => {
  try {
    const job = await careerService.getJobBySlug(req.params.slug);
    return sendSuccess(res, "Job details retrieved successfully.", job);
  } catch (error) {
    next(error);
  }
};

export const createJobPosition = async (req, res, next) => {
  try {
    const job = await careerService.createJob(req.body, req.user._id);
    return sendSuccess(res, "Job position posted successfully.", job, 201);
  } catch (error) {
    next(error);
  }
};

export const updateJobPosition = async (req, res, next) => {
  try {
    const job = await careerService.updateJob(req.params.id, req.body, req.user._id);
    return sendSuccess(res, "Job position details updated successfully.", job);
  } catch (error) {
    next(error);
  }
};

export const deleteJobPosition = async (req, res, next) => {
  try {
    await careerService.deleteJob(req.params.id, req.user._id);
    return sendSuccess(res, "Job position deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── CANDIDATE APPLICATIONS CONTROLLERS ───────────────────────────────────────

export const applyForJob = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("Please upload your PDF resume/CV.");
    }

    // Determine secure url matching storage fallback
    const resumeUrl = isCloudinaryConfigured ? req.file.path : `/uploads/${req.file.filename}`;

    const appData = {
      ...req.body,
      resumeUrl: resumeUrl,
    };

    const application = await careerService.submitApplication(appData);
    return sendSuccess(res, "Your job application has been submitted successfully.", application, 201);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const jobId = req.query.jobId || null;
    const status = req.query.status || null;

    const data = await careerService.getApplications(page, limit, jobId, status);
    return sendSuccess(res, "Candidate applications retrieved successfully.", data);
  } catch (error) {
    next(error);
  }
};

export const getApplicationDetails = async (req, res, next) => {
  try {
    const application = await careerService.getApplicationById(req.params.id);
    return sendSuccess(res, "Application details retrieved successfully.", application);
  } catch (error) {
    next(error);
  }
};

export const changeApplicationStatus = async (req, res, next) => {
  try {
    const { status, interviewNotes } = req.body;
    if (!status) {
      throw new BadRequestError("Status value is required.");
    }

    const application = await careerService.updateApplicationStatus(req.params.id, status, interviewNotes);
    return sendSuccess(res, "Candidate application status updated successfully.", application);
  } catch (error) {
    next(error);
  }
};
