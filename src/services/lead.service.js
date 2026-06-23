import Lead from "../models/Lead.js";
import emailQueue from "../jobs/emailQueue.js";
import NotFoundError from "../errors/NotFoundError.js";
import { sendCustomAdminResponse } from "./email.service.js";

export const createLead = async (leadData, ipAddress) => {
  const lead = await Lead.create({
    ...leadData,
    ipAddress,
    status: "new",
  });

  // Queue background email notifications
  try {
    await emailQueue.add("lead.created", { lead });
  } catch (err) {
    // Fail silently for user, but log error (resilience first!)
    console.error("Failed to enqueue email job for new lead:", err.message);
  }

  return lead;
};

export const getLeads = async (page = 1, limit = 20, status = null, priority = null, search = "") => {
  const query = {};

  if (status) query.status = status;
  if (priority) query.priorityLevel = priority;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { companyName: searchRegex },
      { requirements: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const leads = await Lead.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("assignedAdmin", "name email")
    .populate("notes.adminId", "name email");

  const total = await Lead.countDocuments(query);

  return {
    leads,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getLeadById = async (id) => {
  const lead = await Lead.findById(id)
    .populate("assignedAdmin", "name email")
    .populate("notes.adminId", "name email");

  if (!lead) {
    throw new NotFoundError("Lead inquiry record not found.");
  }

  return lead;
};

export const updateLeadStatus = async (id, status, adminId) => {
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new NotFoundError("Lead inquiry record not found.");
  }

  const oldStatus = lead.status;
  lead.status = status;
  
  // Auto-record status change history as note
  lead.notes.push({
    text: `System Alert: Status changed from '${oldStatus}' to '${status}'.`,
    adminId,
  });

  await lead.save();
  const populated = await Lead.findById(id)
    .populate("assignedAdmin", "name email")
    .populate("notes.adminId", "name email");
  return populated;
};

export const addLeadNote = async (id, noteText, adminId) => {
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new NotFoundError("Lead inquiry record not found.");
  }

  lead.notes.push({
    text: noteText,
    adminId,
  });

  await lead.save();

  // Return populated note details
  const updatedLead = await Lead.findById(id).populate("notes.adminId", "name email");
  return updatedLead.notes;
};

export const respondToLead = async (id, subject, message, adminId) => {
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new NotFoundError("Lead inquiry record not found.");
  }

  // 1. Send email response
  await sendCustomAdminResponse(lead.email, lead.fullName, subject, message);

  // 2. Add history note
  lead.notes.push({
    text: `Admin Sent Email Response: "${subject}"\nMessage:\n${message}`,
    adminId,
  });

  await lead.save();

  // Return updated notes
  const updatedLead = await Lead.findById(id).populate("notes.adminId", "name email");
  return updatedLead.notes;
};

export const deleteLeadNote = async (leadId, noteId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new NotFoundError("Lead inquiry record not found.");
  }
  lead.notes = lead.notes.filter((n) => n._id.toString() !== noteId);
  await lead.save();
  const updatedLead = await Lead.findById(leadId).populate("notes.adminId", "name email");
  return updatedLead.notes;
};
