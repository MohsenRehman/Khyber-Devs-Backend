import * as serviceService from "../services/service.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

export const getAllServices = async (req, res, next) => {
  try {
    // If user is logged in (has req.user) we can show drafts too, but defaults to only published
    const includeDrafts = req.query.includeDrafts === "true";
    const services = await serviceService.getServices(includeDrafts);
    return sendSuccess(res, "Services retrieved successfully.", services);
  } catch (error) {
    next(error);
  }
};

export const getService = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceBySlug(req.params.slug);
    return sendSuccess(res, "Service details retrieved successfully.", service);
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.body, req.user._id);
    return sendSuccess(res, "Service created successfully.", service, 201);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(req.params.id, req.body, req.user._id);
    return sendSuccess(res, "Service updated successfully.", service);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    await serviceService.deleteService(req.params.id, req.user._id);
    return sendSuccess(res, "Service deleted successfully.");
  } catch (error) {
    next(error);
  }
};
