import * as projectService from "../services/project.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

export const getAllProjects = async (req, res, next) => {
  try {
    const category = req.query.category || null;
    const featuredOnly = req.query.featured === "true";
    const projects = await projectService.getProjects(category, featuredOnly);
    return sendSuccess(res, "Portfolio projects retrieved successfully.", projects);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectBySlug(req.params.slug);
    return sendSuccess(res, "Project details retrieved successfully.", project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    return sendSuccess(res, "Project created successfully.", project, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
    return sendSuccess(res, "Project updated successfully.", project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user._id);
    return sendSuccess(res, "Project deleted successfully.");
  } catch (error) {
    next(error);
  }
};
