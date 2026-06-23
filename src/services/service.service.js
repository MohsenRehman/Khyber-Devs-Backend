import Service from "../models/Service.js";
import { getCachedData, setCachedData, invalidateCache } from "../utilities/cache.js";
import NotFoundError from "../errors/NotFoundError.js";

const CACHE_LIST_KEY = "cms:services:list";
const CACHE_SINGLE_PREFIX = "cms:services:slug:";

import { FALLBACK_SERVICES } from "../config/fallbacks.js";

export const getServices = async (includeDrafts = false) => {
  const cacheKey = includeDrafts ? `${CACHE_LIST_KEY}:all` : CACHE_LIST_KEY;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // 2. Fetch DB
    const query = {};
    if (!includeDrafts) {
      query.status = "published";
    }

    const services = await Service.find(query).sort({ displayOrder: 1, createdAt: -1 });

    // 3. Set Cache (1 Hour)
    await setCachedData(cacheKey, services, 3600);

    return services;
  } catch (error) {
    console.warn("MongoDB offline/buffer timeout. serving FALLBACK_SERVICES:", error.message);
    return FALLBACK_SERVICES;
  }
};

export const getServiceBySlug = async (slug) => {
  const cacheKey = `${CACHE_SINGLE_PREFIX}${slug}`;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  // 2. Fetch DB
  const service = await Service.findOne({ slug, status: "published" });
  if (!service) {
    throw new NotFoundError(`Service with slug '${slug}' not found.`);
  }

  // 3. Set Cache (1 Hour)
  await setCachedData(cacheKey, service, 3600);

  return service;
};

export const createService = async (data, adminId) => {
  const service = await Service.create({
    ...data,
    createdBy: adminId,
  });

  // Invalidate List Caches
  await invalidateCache("cms:services:*");

  return service;
};

export const updateService = async (id, data, adminId) => {
  const service = await Service.findById(id);
  if (!service) {
    throw new NotFoundError("Service record not found.");
  }

  const oldSlug = service.slug;

  Object.assign(service, data);
  await service.save();

  // Invalidate Caches (lists and the specific single slug caches)
  await invalidateCache("cms:services:*");
  if (oldSlug) {
    await invalidateCache(`${CACHE_SINGLE_PREFIX}${oldSlug}`);
  }
  await invalidateCache(`${CACHE_SINGLE_PREFIX}${service.slug}`);

  return service;
};

export const deleteService = async (id, adminId) => {
  const service = await Service.findById(id);
  if (!service) {
    throw new NotFoundError("Service record not found.");
  }

  service.isDeleted = true;
  service.deletedAt = new Date();
  service.deletedBy = adminId;
  await service.save();

  // Invalidate Caches
  await invalidateCache("cms:services:*");
  await invalidateCache(`${CACHE_SINGLE_PREFIX}${service.slug}`);

  return service;
};
