import * as testimonialService from "../services/testimonial.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

export const getAllTestimonials = async (req, res, next) => {
  try {
    const featuredOnly = req.query.featured === "true";
    const testimonials = await testimonialService.getTestimonials(featuredOnly);
    return sendSuccess(res, "Testimonials retrieved successfully.", testimonials);
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.createTestimonial(req.body, req.user._id);
    return sendSuccess(res, "Testimonial created successfully.", testimonial, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body, req.user._id);
    return sendSuccess(res, "Testimonial updated successfully.", testimonial);
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    await testimonialService.deleteTestimonial(req.params.id, req.user._id);
    return sendSuccess(res, "Testimonial deleted successfully.");
  } catch (error) {
    next(error);
  }
};
