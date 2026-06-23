import * as analyticsService from "../services/analytics.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

export const getStatsSummary = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    return sendSuccess(res, "Admin stats summaries retrieved successfully.", stats);
  } catch (error) {
    next(error);
  }
};
