import VisitorEvent from "../models/VisitorEvent.js";
import AnalyticsSummary from "../models/AnalyticsSummary.js";
import Lead from "../models/Lead.js";
import Project from "../models/Project.js";
import Blog from "../models/Blog.js";
import Team from "../models/Team.js";
import JobPosition from "../models/JobPosition.js";
import CandidateApplication from "../models/CandidateApplication.js";
import logger from "../config/logger.js";

/**
 * Aggregates raw VisitorEvent documents for a specific date into AnalyticsSummary.
 * Prunes raw logs older than 30 days to prevent DB bloat.
 * @param {string} dateString - Target date format YYYY-MM-DD (e.g. '2026-06-22')
 */
export const aggregateDailyStats = async (dateString) => {
  try {
    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

    // 1. Fetch raw visitor events for the day
    const events = await VisitorEvent.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (events.length === 0) {
      logger.info(`No visitor events to aggregate for date: ${dateString}`);
      return null;
    }

    const pageViews = events.length;

    // 2. Count Unique IPs
    const uniqueIPs = new Set(events.map((e) => e.ipAddress));
    const uniqueVisitors = uniqueIPs.size;

    // 3. Aggregate Countries
    const countryMap = {};
    const deviceMap = {};
    const browserMap = {};

    events.forEach((e) => {
      countryMap[e.country] = (countryMap[e.country] || 0) + 1;
      deviceMap[e.deviceType] = (deviceMap[e.deviceType] || 0) + 1;
      browserMap[e.browser] = (browserMap[e.browser] || 0) + 1;
    });

    const countries = Object.entries(countryMap).map(([name, count]) => ({ name, count }));
    const devices = Object.entries(deviceMap).map(([name, count]) => ({ name, count }));
    const browsers = Object.entries(browserMap).map(([name, count]) => ({ name, count }));

    // 4. Query lead conversions count for the day
    const conversions = await Lead.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // 5. Save/Upsert AnalyticsSummary document
    const summary = await AnalyticsSummary.findOneAndUpdate(
      { date: dateString },
      {
        date: dateString,
        pageViews,
        uniqueVisitors,
        countries,
        devices,
        browsers,
        conversions,
      },
      { upsert: true, new: true }
    );

    logger.info(`Daily analytics successfully aggregated for ${dateString}: ${pageViews} views, ${uniqueVisitors} uniques.`);

    // 6. DB CLEANUP: Prune raw events older than 30 days
    const pruneThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleteResult = await VisitorEvent.deleteMany({
      createdAt: { $lt: pruneThreshold },
    });
    if (deleteResult.deletedCount > 0) {
      logger.info(`Pruned ${deleteResult.deletedCount} visitor events older than 30 days.`);
    }

    return summary;
  } catch (error) {
    logger.error(`Daily stats aggregation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Returns complete aggregated system statistics for the admin dashboard
 */
export const getDashboardStats = async () => {
  // Concurrently fetch collection totals
  const [
    totalLeads,
    totalProjects,
    totalBlogs,
    totalTeam,
    totalJobs,
    totalApplications,
  ] = await Promise.all([
    Lead.countDocuments(),
    Project.countDocuments(),
    Blog.countDocuments(),
    Team.countDocuments(),
    JobPosition.countDocuments(),
    CandidateApplication.countDocuments(),
  ]);

  // Aggregate leads status distribution
  const leadsByStatusRaw = await Lead.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const leadsByStatus = {
    new: 0,
    contacted: 0,
    meeting_scheduled: 0,
    proposal_sent: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };

  leadsByStatusRaw.forEach((item) => {
    if (leadsByStatus[item._id] !== undefined) {
      leadsByStatus[item._id] = item.count;
    }
  });

  // Calculate approximate Revenue Potential (sum of won leads, etc. - placeholder logic)
  // Let's return a clean stats packet
  const newLeadsCount = leadsByStatus.new;

  // Retrieve last 30 days of aggregated Analytics summaries for charts
  const analyticsHistory = await AnalyticsSummary.find()
    .sort({ date: -1 })
    .limit(30);

  // Reverse to chronological order (for charts)
  analyticsHistory.reverse();

  return {
    totals: {
      leads: totalLeads,
      newLeads: newLeadsCount,
      projects: totalProjects,
      blogs: totalBlogs,
      teamMembers: totalTeam,
      activeJobs: totalJobs,
      jobApplications: totalApplications,
    },
    leadsByStatus,
    analyticsHistory,
  };
};
