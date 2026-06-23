import Blog from "../models/Blog.js";
import { getCachedData, setCachedData, invalidateCache } from "../utilities/cache.js";
import NotFoundError from "../errors/NotFoundError.js";

const CACHE_LIST_PREFIX = "cms:blogs:list:";
const CACHE_SINGLE_PREFIX = "cms:blogs:slug:";

export const getBlogs = async (page = 1, limit = 10, category = null, includeDrafts = false, search = "") => {
  const status = includeDrafts ? "all" : "published";
  const cacheKey = `${CACHE_LIST_PREFIX}${page}:${limit}:${category || "any"}:${status}:${search || "none"}`;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  // 2. Fetch DB
  const query = {};
  if (!includeDrafts) {
    query.status = "published";
  }
  if (category) {
    query.category = category;
  }
  if (search) {
    const searchRegex = new RegExp(search, "i");
    // Search on title, category, tags, and plain text contentText!
    query.$or = [
      { title: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
      { contentText: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const blogs = await Blog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name email profileImage jobTitle");

  const total = await Blog.countDocuments(query);

  const result = {
    blogs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };

  // 3. Set Cache (30 Minutes - shorter TTL since blogs can update)
  await setCachedData(cacheKey, result, 1800);

  return result;
};

export const getBlogBySlug = async (slug) => {
  const cacheKey = `${CACHE_SINGLE_PREFIX}${slug}`;

  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  
  // Increment view counter asynchronously in DB regardless of cache hit
  // to track accurate view telemetry without delaying responses
  setImmediate(async () => {
    try {
      await Blog.updateOne({ slug }, { $inc: { views: 1 } });
    } catch (err) {
      console.error(`Failed to increment blog views for slug '${slug}':`, err.message);
    }
  });

  if (cached) {
    // Add 1 to cached views just for visual response matching
    cached.views += 1;
    return cached;
  }

  // 2. Fetch DB
  const blog = await Blog.findOne({ slug, status: "published" }).populate(
    "author",
    "name email profileImage jobTitle biography"
  );

  if (!blog) {
    throw new NotFoundError(`Blog article with slug '${slug}' not found.`);
  }

  // 3. Set Cache (30 Minutes)
  await setCachedData(cacheKey, blog, 1800);

  return blog;
};

export const createBlog = async (data, adminId) => {
  const blog = await Blog.create({
    ...data,
    author: adminId,
  });

  // Invalidate List Caches
  await invalidateCache("cms:blogs:*");

  return blog;
};

export const updateBlog = async (id, data, adminId) => {
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError("Blog record not found.");
  }

  const oldSlug = blog.slug;

  Object.assign(blog, data);
  await blog.save();

  // Invalidate Caches
  await invalidateCache("cms:blogs:*");
  if (oldSlug) {
    await invalidateCache(`${CACHE_SINGLE_PREFIX}${oldSlug}`);
  }
  await invalidateCache(`${CACHE_SINGLE_PREFIX}${blog.slug}`);

  return blog;
};

export const deleteBlog = async (id, adminId) => {
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError("Blog record not found.");
  }

  blog.isDeleted = true;
  blog.deletedAt = new Date();
  blog.deletedBy = adminId;
  await blog.save();

  // Invalidate Caches
  await invalidateCache("cms:blogs:*");
  await invalidateCache(`${CACHE_SINGLE_PREFIX}${blog.slug}`);

  return blog;
};
