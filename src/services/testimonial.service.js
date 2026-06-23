import Testimonial from "../models/Testimonial.js";
import { getCachedData, setCachedData, invalidateCache } from "../utilities/cache.js";
import NotFoundError from "../errors/NotFoundError.js";

const CACHE_LIST_KEY = "cms:testimonials:list";

export const getTestimonials = async (featuredOnly = false) => {
  const cacheKey = featuredOnly ? `${CACHE_LIST_KEY}:featured` : CACHE_LIST_KEY;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  // 2. Fetch DB
  const query = {};
  if (featuredOnly) {
    query.featuredStatus = true;
  }

  const testimonials = await Testimonial.find(query)
    .sort({ createdAt: -1 })
    .populate("projectRelated", "projectName category");

  // 3. Set Cache (1 Hour)
  await setCachedData(cacheKey, testimonials, 3600);

  return testimonials;
};

export const createTestimonial = async (data, adminId) => {
  const testimonial = await Testimonial.create({
    ...data,
    createdBy: adminId,
  });

  // Invalidate Cache
  await invalidateCache("cms:testimonials:*");

  return testimonial;
};

export const updateTestimonial = async (id, data, adminId) => {
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) {
    throw new NotFoundError("Testimonial record not found.");
  }

  Object.assign(testimonial, data);
  await testimonial.save();

  // Invalidate Cache
  await invalidateCache("cms:testimonials:*");

  return testimonial;
};

export const deleteTestimonial = async (id, adminId) => {
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) {
    throw new NotFoundError("Testimonial record not found.");
  }

  testimonial.isDeleted = true;
  testimonial.deletedAt = new Date();
  testimonial.deletedBy = adminId;
  await testimonial.save();

  // Invalidate Cache
  await invalidateCache("cms:testimonials:*");

  return testimonial;
};
