import { Resend } from "resend";
import logger from "../config/logger.js";

let resendClient = null;
const apiKey = process.env.RESEND_API_KEY;

if (apiKey && apiKey !== "mock_resend_api_key") {
  try {
    resendClient = new Resend(apiKey);
    logger.info("Resend email service client initialized.");
  } catch (error) {
    logger.error(`Failed to initialize Resend email client: ${error.message}`);
  }
} else {
  logger.warn("Resend API key missing or set to mock. Email service running in console logger mock mode.");
}

/**
 * Dispatches an email using Resend API or logs to console if mock.
 */
export const sendEmail = async ({ to, subject, html }) => {
  const fromAddress = process.env.FROM_EMAIL || "noreply@khberdevs.com";

  if (!resendClient) {
    logger.info(`
[EMAIL MOCK DISPATCH]
----------------------------------------------------------------------
From:    ${fromAddress}
To:      ${to}
Subject: ${subject}
Content:
${html.replace(/<[^>]*>/g, " ").trim()}
----------------------------------------------------------------------`);
    return { id: `mock-email-id-${Date.now()}` };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      logger.error(`Resend API error: ${error.message}`);
      throw new Error(error.message);
    }

    logger.info(`Email successfully dispatched via Resend API. ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error(`Email delivery failed: ${error.message}`);
    throw error;
  }
};

// ─── EMAIL TEMPLATE GENERATORS ───────────────────────────────────────────────

export const sendLeadAdminNotification = async (lead) => {
  const adminEmail = process.env.ADMIN_EMAIL || "rehmanmohsen31@gmail.com";
  const subject = `🔥 New Lead Inquiry: ${lead.projectType} from ${lead.fullName}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">New Project Lead Received</h2>
      <p>A new lead planner has been submitted on the website. Details are listed below:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold; width: 150px;">Full Name:</td><td style="padding: 8px;">${lead.fullName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email Address:</td><td style="padding: 8px;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Phone Number:</td><td style="padding: 8px;">${lead.phone || "N/A"}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Company Name:</td><td style="padding: 8px;">${lead.companyName || "N/A"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Project Type:</td><td style="padding: 8px;">${lead.projectType}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Budget Range:</td><td style="padding: 8px;">${lead.budgetRange}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Timeline:</td><td style="padding: 8px;">${lead.expectedTimeline}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">IP Address:</td><td style="padding: 8px;">${lead.ipAddress || "Unknown"}</td></tr>
      </table>
      
      <h3 style="color: #374151; margin-top: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">Project Requirements</h3>
      <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #4b5563; font-style: italic;">
        ${lead.requirements ? lead.requirements.replace(/\n/g, "<br/>") : "No specific requirements provided."}
      </p>
      
      <div style="margin-top: 25px; text-align: center;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/admin/leads" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">View In Admin Dashboard</a>
      </div>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
};

export const sendLeadClientConfirmation = async (lead) => {
  const subject = `Thank you for contacting KHBER DEVS!`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; line-height: 1.6; color: #374151;">
      <div style="text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;">
        <h1 style="color: #4f46e5; margin: 0;">KHBER DEVS</h1>
        <span style="font-size: 12px; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase;">Software Engineering House</span>
      </div>
      
      <p style="margin-top: 20px;">Dear <strong>${lead.fullName}</strong>,</p>
      <p>Thank you for submitting your project specifications to KHBER DEVS. We are excited about the opportunity to partner with you.</p>
      
      <p>Our lead full-stack MERN & AI architect, <strong>Mohsen Rehman</strong>, is currently reviewing your blueprint details:</p>
      <ul style="background: #f9fafb; padding: 15px 30px; border-radius: 8px; list-style-type: square; font-size: 14px;">
        <li><strong>Project Class:</strong> ${lead.projectType}</li>
        <li><strong>Selected Budget:</strong> ${lead.budgetRange}</li>
        <li><strong>Desired Timeline:</strong> ${lead.expectedTimeline}</li>
      </ul>
      
      <p>A technical advisor from our Peshawari team coordinates reviews within 24 hours. We will reach out to schedule a discovery call or deliver a draft architecture proposal.</p>
      
      <p style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 15px; font-size: 12px; color: #9ca3af; text-align: center;">
        © 2026 KHBER DEVS. Standard SLAs & NDAs apply. Peshawar, KPK, Pakistan.
      </p>
    </div>
  `;

  return sendEmail({ to: lead.email, subject, html });
};

export const sendApplicationAdminNotification = async (application, job) => {
  const adminEmail = process.env.ADMIN_EMAIL || "rehmanmohsen31@gmail.com";
  const subject = `💼 New Job Application: ${job.title} from ${application.name}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #9333ea; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">New Candidate Application</h2>
      <p>A new applicant has submitted a resume on the careers portal:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold; width: 150px;">Position:</td><td style="padding: 8px;">${job.title} (${job.location})</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Candidate Name:</td><td style="padding: 8px;">${application.name}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${application.email}">${application.email}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${application.phone || "N/A"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Portfolio URL:</td><td style="padding: 8px;"><a href="${application.portfolioLink}" target="_blank">${application.portfolioLink || "N/A"}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">LinkedIn:</td><td style="padding: 8px;"><a href="${application.linkedIn}" target="_blank">${application.linkedIn || "N/A"}</a></td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Resume Link:</td><td style="padding: 8px;"><a href="${application.resumeUrl}" target="_blank" style="color: #9333ea; font-weight: bold;">Download PDF CV</a></td></tr>
      </table>
      
      <h3 style="color: #374151; margin-top: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">Cover Letter / Intro</h3>
      <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #4b5563; font-style: italic;">
        ${application.coverLetter ? application.coverLetter.replace(/\n/g, "<br/>") : "No cover letter provided."}
      </p>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
};

export const sendApplicationCandidateConfirmation = async (application, job) => {
  const subject = `We received your application for ${job.title} - KHBER DEVS`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; line-height: 1.6; color: #374151;">
      <h2 style="color: #9333ea; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Application Received</h2>
      <p>Dear <strong>${application.name}</strong>,</p>
      <p>Thank you for applying for the position of <strong>${job.title} (${job.type})</strong> at KHBER DEVS.</p>
      
      <p>Our senior engineering desk is currently screening submissions. If your profile aligns with our strict architectural requirements, our hiring coordinator will contact you to schedule a mock assessment or standard interview loops.</p>
      
      <p>We appreciate your interest in joining our development house.</p>
      
      <p style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 15px; font-size: 12px; color: #9ca3af; text-align: center;">
        © 2026 KHBER DEVS. All applications reviewed in confidence. Peshawar, KPK, Pakistan.
      </p>
    </div>
  `;

  return sendEmail({ to: application.email, subject, html });
};

export const sendCustomAdminResponse = async (email, clientName, subject, message) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; line-height: 1.6; color: #374151;">
      <div style="text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;">
        <h1 style="color: #4f46e5; margin: 0;">KHBER DEVS</h1>
        <span style="font-size: 12px; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase;">Software Engineering House</span>
      </div>
      
      <p style="margin-top: 20px;">Dear <strong>${clientName}</strong>,</p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
      
      <p style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 15px; font-size: 12px; color: #9ca3af; text-align: center;">
        © 2026 KHBER DEVS. Standard SLAs & NDAs apply. Peshawar, KPK, Pakistan.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};
