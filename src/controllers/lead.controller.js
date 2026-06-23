import * as leadService from "../services/lead.service.js";
import { sendSuccess } from "../utilities/responseFormatter.js";
import BadRequestError from "../errors/BadRequestError.js";

export const submitLead = async (req, res, next) => {
  try {
    const ipAddress = req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || "127.0.0.1";
    const lead = await leadService.createLead(req.body, ipAddress);
    return sendSuccess(res, "Your project specifications have been submitted successfully.", lead, 201);
  } catch (error) {
    next(error);
  }
};

export const getLeadsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const status = req.query.status || null;
    const priority = req.query.priority || null;
    const search = req.query.search || "";

    const data = await leadService.getLeads(page, limit, status, priority, search);
    return sendSuccess(res, "Lead inquiries list retrieved successfully.", data);
  } catch (error) {
    next(error);
  }
};

export const getLeadDetails = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    return sendSuccess(res, "Lead details retrieved successfully.", lead);
  } catch (error) {
    next(error);
  }
};

export const changeLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw new BadRequestError("Pipeline status state is required.");
    }

    const lead = await leadService.updateLeadStatus(req.params.id, status, req.user._id);
    return sendSuccess(res, "Lead pipeline status updated successfully.", lead);
  } catch (error) {
    next(error);
  }
};

export const appendLeadNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      throw new BadRequestError("Note content text cannot be empty.");
    }

    const notes = await leadService.addLeadNote(req.params.id, note, req.user._id);
    return sendSuccess(res, "Note added successfully to lead file.", notes, 201);
  } catch (error) {
    next(error);
  }
};

export const replyToLead = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !subject.trim() || !message || !message.trim()) {
      throw new BadRequestError("Both subject and message content are required to respond.");
    }

    const notes = await leadService.respondToLead(req.params.id, subject, message, req.user._id);
    return sendSuccess(res, "Response email dispatched and logged successfully.", notes, 201);
  } catch (error) {
    next(error);
  }
};

export const removeLeadNote = async (req, res, next) => {
  try {
    const notes = await leadService.deleteLeadNote(req.params.id, req.params.noteId);
    return sendSuccess(res, "Note deleted successfully from lead file.", notes);
  } catch (error) {
    next(error);
  }
};
