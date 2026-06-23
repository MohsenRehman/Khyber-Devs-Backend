import Project from "../models/Project.js";
import { getCachedData, setCachedData, invalidateCache } from "../utilities/cache.js";
import NotFoundError from "../errors/NotFoundError.js";

const CACHE_LIST_KEY = "cms:projects:list";
const CACHE_SINGLE_PREFIX = "cms:projects:slug:";

import { FALLBACK_PROJECTS } from "../config/fallbacks.js";

export const getProjects = async (category = null, featuredOnly = false) => {
  let cacheKey = CACHE_LIST_KEY;
  if (category) cacheKey += `:cat:${category}`;
  if (featuredOnly) cacheKey += `:featured`;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // 2. Fetch DB
    const query = {};
    if (category) {
      query.category = category;
    }
    if (featuredOnly) {
      query.featuredProject = true;
    }

    const projects = await Project.find(query)
      .populate("builtBy", "name role profileImage")
      .sort({ completionDate: -1, createdAt: -1 });

    // 3. Set Cache (1 Hour)
    await setCachedData(cacheKey, projects, 3600);

    return projects;
  } catch (error) {
    console.warn("MongoDB offline/buffer timeout. serving FALLBACK_PROJECTS:", error.message);
    return FALLBACK_PROJECTS;
  }
};

export const getProjectBySlug = async (slug) => {
  const cacheKey = `${CACHE_SINGLE_PREFIX}${slug}`;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  // 2. Fetch DB
  const project = await Project.findOne({ slug })
    .populate("builtBy", "name role profileImage");
  if (!project) {
    throw new NotFoundError(`Project with slug '${slug}' not found.`);
  }

  // 3. Set Cache (1 Hour)
  await setCachedData(cacheKey, project, 3600);

  return project;
};

export const createProject = async (data, adminId) => {
  const project = await Project.create({
    ...data,
    createdBy: adminId,
  });

  // Invalidate Cache
  await invalidateCache("cms:projects:*");

  return project;
};

export const updateProject = async (id, data, adminId) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new NotFoundError("Project record not found.");
  }

  const oldSlug = project.slug;

  Object.assign(project, data);
  await project.save();

  // Invalidate Caches
  await invalidateCache("cms:projects:*");
  if (oldSlug) {
    await invalidateCache(`${CACHE_SINGLE_PREFIX}${oldSlug}`);
  }
  await invalidateCache(`${CACHE_SINGLE_PREFIX}${project.slug}`);

  return project;
};

export const deleteProject = async (id, adminId) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new NotFoundError("Project record not found.");
  }

  project.isDeleted = true;
  project.deletedAt = new Date();
  project.deletedBy = adminId;
  await project.save();

  // Invalidate Caches
  await invalidateCache("cms:projects:*");
  await invalidateCache(`${CACHE_SINGLE_PREFIX}${project.slug}`);

  return project;
};
