import express from "express";
import Service from "../models/Service.js";
import Project from "../models/Project.js";
import Blog from "../models/Blog.js";
import { getCachedData, setCachedData } from "../utilities/cache.js";
import logger from "../config/logger.js";

const router = express.Router();
const CACHE_KEY = "seo:sitemap";

const generateSitemapXml = (services, projects, blogs, domain) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Pages
  const staticPaths = ["", "/about", "/services", "/portfolio", "/pricing", "/careers", "/contact"];
  staticPaths.forEach((path) => {
    xml += `  <url>\n    <loc>${domain}${path}</loc>\n    <priority>${path === "" ? "1.0" : "0.8"}</priority>\n    <changefreq>monthly</changefreq>\n  </url>\n`;
  });

  // 2. Dynamic Services
  services.forEach((s) => {
    xml += `  <url>\n    <loc>${domain}/services/${s.slug}</loc>\n    <priority>0.7</priority>\n    <changefreq>monthly</changefreq>\n  </url>\n`;
  });

  // 3. Dynamic Projects
  projects.forEach((p) => {
    xml += `  <url>\n    <loc>${domain}/portfolio/${p.slug}</loc>\n    <priority>0.7</priority>\n    <changefreq>monthly</changefreq>\n  </url>\n`;
  });

  // 4. Dynamic Blogs
  blogs.forEach((b) => {
    xml += `  <url>\n    <loc>${domain}/blogs/${b.slug}</loc>\n    <priority>0.6</priority>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
};

// GET /sitemap.xml
router.get("/", async (req, res, next) => {
  try {
    // 1. Try reading from cache
    const cachedSitemap = await getCachedData(CACHE_KEY);
    if (cachedSitemap) {
      res.header("Content-Type", "application/xml");
      return res.status(200).send(cachedSitemap);
    }

    // 2. Concurrently fetch slugs from database
    const [services, projects, blogs] = await Promise.all([
      Service.find({ status: "published" }).select("slug"),
      Project.find({}).select("slug"), // projects don't have status defaults
      Blog.find({ status: "published" }).select("slug"),
    ]);

    // 3. Construct sitemap
    const clientDomain = process.env.CLIENT_URL || "https://khberdevs.com";
    const sitemapXml = generateSitemapXml(services, projects, blogs, clientDomain);

    // 4. Set Redis cache (expire in 12 hours)
    await setCachedData(CACHE_KEY, sitemapXml, 12 * 60 * 60);

    // 5. Send XML response
    res.header("Content-Type", "application/xml");
    return res.status(200).send(sitemapXml);
  } catch (error) {
    logger.error(`Failed to generate sitemap.xml: ${error.message}`);
    // Return a basic backup sitemap in case of errors
    res.header("Content-Type", "application/xml");
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://khberdevs.com/</loc></url></urlset>`);
  }
});

export default router;
