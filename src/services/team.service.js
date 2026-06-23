import Team from "../models/Team.js";
import { getCachedData, setCachedData, invalidateCache } from "../utilities/cache.js";
import NotFoundError from "../errors/NotFoundError.js";
import { FALLBACK_TEAM } from "../config/fallbacks.js";
const CACHE_KEY = "cms:team:list";

export const getTeam = async (includeHidden = false) => {
  const cacheKey = includeHidden ? `${CACHE_KEY}:all` : CACHE_KEY;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // 2. Fetch DB
    const query = {};
    // If not includeHidden, query all non-deleted (can be filtered further as needed)
    const teamMembers = await Team.find(query).sort({ displayOrder: 1, createdAt: -1 });

    // 3. Set Cache (1 Hour)
    await setCachedData(cacheKey, teamMembers, 3600);

    return teamMembers;
  } catch (error) {
    console.warn("MongoDB offline/buffer timeout. Serving FALLBACK_TEAM:", error.message);
    return FALLBACK_TEAM;
  }
};


export const createTeamMember = async (data, adminId) => {
  const member = await Team.create({
    ...data,
    createdBy: adminId,
  });

  // Invalidate Cache
  await invalidateCache("cms:team:*");

  return member;
};

export const updateTeamMember = async (id, data, adminId) => {
  const member = await Team.findById(id);
  if (!member) {
    throw new NotFoundError("Team member record not found.");
  }

  Object.assign(member, data);
  await member.save();

  // Invalidate Cache
  await invalidateCache("cms:team:*");

  return member;
};

export const deleteTeamMember = async (id, adminId) => {
  const member = await Team.findById(id);
  if (!member) {
    throw new NotFoundError("Team member record not found.");
  }

  member.isDeleted = true;
  member.deletedAt = new Date();
  member.deletedBy = adminId;
  await member.save();

  // Invalidate Cache
  await invalidateCache("cms:team:*");

  return member;
};
