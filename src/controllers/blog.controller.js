import * as blogService from "../services/blog.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

export const getAllBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const category = req.query.category || null;
    const includeDrafts = req.query.includeDrafts === "true";
    const search = req.query.search || "";

    const data = await blogService.getBlogs(page, limit, category, includeDrafts, search);
    return sendSuccess(res, "Blog articles retrieved successfully.", data);
  } catch (error) {
    next(error);
  }
};

export const getBlog = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug);
    return sendSuccess(res, "Blog article details retrieved successfully.", blog);
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlog(req.body, req.user._id);
    return sendSuccess(res, "Blog article created and saved successfully.", blog, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, req.body, req.user._id);
    return sendSuccess(res, "Blog article updated successfully.", blog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlog(req.params.id, req.user._id);
    return sendSuccess(res, "Blog article deleted successfully.");
  } catch (error) {
    next(error);
  }
};
