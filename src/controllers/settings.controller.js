import * as settingsService from "../services/settings.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, "System settings retrieved successfully.", settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body, req.user._id);
    return sendSuccess(res, "System settings updated successfully.", settings);
  } catch (error) {
    next(error);
  }
};
