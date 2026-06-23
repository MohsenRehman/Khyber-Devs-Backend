import JobPosition from "../models/JobPosition.js";
import CandidateApplication from "../models/CandidateApplication.js";
import emailQueue from "../jobs/emailQueue.js";
import NotFoundError from "../errors/NotFoundError.js";
import { getCachedData, setCachedData, invalidateCache } from "../utilities/cache.js";
import { FALLBACK_JOBS } from "../config/fallbacks.js";

const CACHE_KEY_JOBS = "cms:jobs:list";

export const getJobs = async (includeDrafts = false) => {
  const cacheKey = includeDrafts ? `${CACHE_KEY_JOBS}:all` : CACHE_KEY_JOBS;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // 2. Fetch DB
    const query = {};
    if (!includeDrafts) {
      query.status = "published";
    }

    const jobs = await JobPosition.find(query).sort({ displayOrder: 1, createdAt: -1 });

    // 3. Set Cache (1 Hour)
    await setCachedData(cacheKey, jobs, 3600);

    return jobs;
  } catch (error) {
    console.warn("MongoDB offline/buffer timeout. Serving FALLBACK_JOBS:", error.message);
    return FALLBACK_JOBS;
  }
};

export const getJobBySlug = async (slug) => {
  const job = await JobPosition.findOne({ slug, status: "published" });
  if (!job) {
    throw new NotFoundError(`Job position with slug '${slug}' not found.`);
  }
  return job;
};

export const createJob = async (data, adminId) => {
  const job = await JobPosition.create({
    ...data,
    createdBy: adminId,
  });

  // Invalidate Cache
  await invalidateCache("cms:jobs:*");

  return job;
};

export const updateJob = async (id, data, adminId) => {
  const job = await JobPosition.findById(id);
  if (!job) {
    throw new NotFoundError("Job position not found.");
  }

  Object.assign(job, data);
  await job.save();

  // Invalidate Cache
  await invalidateCache("cms:jobs:*");

  return job;
};

export const deleteJob = async (id, adminId) => {
  const job = await JobPosition.findById(id);
  if (!job) {
    throw new NotFoundError("Job position not found.");
  }

  job.isDeleted = true;
  job.deletedAt = new Date();
  job.deletedBy = adminId;
  await job.save();

  // Invalidate Cache
  await invalidateCache("cms:jobs:*");

  return job;
};

import mongoose from "mongoose";

// ─── CANDIDATE APPLICATIONS ──────────────────────────────────────────────────

export const submitApplication = async (appData) => {
  let jobId = appData.jobId;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    // If it's a static fallback ID (like 'c1'), resolve to first published job in DB
    const firstJob = await JobPosition.findOne({ status: "published" });
    if (firstJob) {
      jobId = firstJob._id;
    } else {
      throw new NotFoundError("The job position you are applying for is closed or unavailable.");
    }
  }

  const job = await JobPosition.findById(jobId);
  if (!job || job.status !== "published") {
    throw new NotFoundError("The job position you are applying for is closed or unavailable.");
  }

  const application = await CandidateApplication.create({
    ...appData,
    jobId,
  });

  // Queue background email notifications
  try {
    await emailQueue.add("application.created", {
      application,
      job: { title: job.title, location: job.location, type: job.type },
    });
  } catch (err) {
    // Silent fail for user, log error
    console.error("Failed to enqueue email job for candidate application:", err.message);
  }

  return application;
};

export const getApplications = async (page = 1, limit = 20, jobId = null, status = null) => {
  const query = {};
  if (jobId) query.jobId = jobId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const applications = await CandidateApplication.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("jobId", "title department location type");

  const total = await CandidateApplication.countDocuments(query);

  return {
    applications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getApplicationById = async (id) => {
  const application = await CandidateApplication.findById(id).populate(
    "jobId",
    "title department location type requirements"
  );
  if (!application) {
    throw new NotFoundError("Candidate application file not found.");
  }
  return application;
};

export const updateApplicationStatus = async (id, status, interviewNotes = "") => {
  const application = await CandidateApplication.findById(id);
  if (!application) {
    throw new NotFoundError("Candidate application file not found.");
  }

  application.status = status;
  if (interviewNotes) {
    application.interviewNotes = interviewNotes;
  }

  await application.save();
  return application;
};
