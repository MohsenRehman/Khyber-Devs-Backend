import * as mediaService from "../services/media.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";
import BadRequestError from "../errors/BadRequestError.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("Please upload a file payload.");
    }

    const folder = req.body.folder || "Company";
    const media = await mediaService.saveMediaInfo(req.file, req.user._id, folder);

    return sendSuccess(res, "File uploaded successfully to media library.", media, 201);
  } catch (error) {
    next(error);
  }
};

export const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError("Please upload at least one file payload.");
    }

    const folder = req.body.folder || "Company";
    const savedFiles = [];

    for (const file of req.files) {
      const media = await mediaService.saveMediaInfo(file, req.user._id, folder);
      savedFiles.push(media);
    }

    return sendSuccess(res, `Successfully uploaded ${savedFiles.length} files.`, savedFiles, 201);
  } catch (error) {
    next(error);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const folder = req.query.folder;

    const data = await mediaService.listMedia(page, limit, folder);
    return sendSuccess(res, "Files retrieved successfully.", data);
  } catch (error) {
    next(error);
  }
};

export const removeFile = async (req, res, next) => {
  try {
    const media = await mediaService.deleteMedia(req.params.id, req.user._id);
    return sendSuccess(res, "File deleted successfully from media library.", media);
  } catch (error) {
    next(error);
  }
};
