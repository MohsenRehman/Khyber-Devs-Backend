import crypto from "crypto";
import Admin from "../models/Admin.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utilities/jwt.js";

/**
 * SHA-256 Helper to securely hash refresh tokens before storing in database
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const loginAdmin = async (email, password, ipAddress, userAgent) => {
  // Query admin, explicitly selecting password & hashedRefreshTokens
  const admin = await Admin.findOne({ email }).select("+password +hashedRefreshTokens");
  
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password credentials.");
  }

  // Check Lockout Status
  if (admin.isLocked()) {
    const minutesLeft = Math.ceil((admin.lockedUntil - Date.now()) / 1000 / 60);
    throw new ForbiddenError(`Account locked due to consecutive failures. Try again in ${minutesLeft} minutes.`);
  }

  // Compare passwords
  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    // Increment failures
    admin.failedLoginAttempts += 1;
    
    if (admin.failedLoginAttempts >= 5) {
      admin.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lockout
      admin.status = "locked";
      await admin.save();
      throw new ForbiddenError("Too many failed attempts. Your account has been locked for 30 minutes.");
    }
    
    await admin.save();
    const attemptsLeft = 5 - admin.failedLoginAttempts;
    throw new UnauthorizedError(`Invalid email or password. You have ${attemptsLeft} attempts remaining.`);
  }

  // Check if admin is suspended
  if (admin.status === "suspended") {
    throw new ForbiddenError("This administrator account has been suspended by a Super Admin.");
  }

  // Success: Reset failed attempts & lockouts
  admin.failedLoginAttempts = 0;
  admin.lockedUntil = undefined;
  admin.status = "active";
  admin.lastLogin = new Date();

  // Log to history (keep history to last 15 entries to avoid document swelling)
  admin.loginHistory.push({ ipAddress, userAgent });
  if (admin.loginHistory.length > 15) {
    admin.loginHistory.shift();
  }

  // Generate Tokens
  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  // Hash & store Refresh Token
  const hashedToken = hashToken(refreshToken);
  admin.hashedRefreshTokens.push(hashedToken);
  
  // Enforce session limit (limit to 5 active devices/sessions)
  if (admin.hashedRefreshTokens.length > 5) {
    admin.hashedRefreshTokens.shift();
  }

  await admin.save();

  // Hide sensitive fields in returned object
  const adminJSON = admin.toJSON();
  delete adminJSON.password;
  delete adminJSON.hashedRefreshTokens;

  return { admin: adminJSON, accessToken, refreshToken };
};

export const logoutAdmin = async (adminId, refreshToken) => {
  const admin = await Admin.findById(adminId).select("+hashedRefreshTokens");
  if (!admin) return;

  const hashedToken = hashToken(refreshToken);
  admin.hashedRefreshTokens = admin.hashedRefreshTokens.filter((t) => t !== hashedToken);
  
  await admin.save();
};

export const refreshSession = async (token) => {
  if (!token) {
    throw new UnauthorizedError("Refresh token missing from session.");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new UnauthorizedError("Expired or invalid refresh session token.");
  }

  // Find admin, selecting token list
  const admin = await Admin.findById(decoded.id).select("+hashedRefreshTokens");
  if (!admin || admin.status === "suspended") {
    throw new UnauthorizedError("Session admin no longer exists or is suspended.");
  }

  const hashedToken = hashToken(token);
  const tokenIndex = admin.hashedRefreshTokens.indexOf(hashedToken);

  // --- REUSE DETECTION PROTOCOL ---
  // If the verified token is NOT found in the database, it implies the token has already been consumed
  // or stolen. We trigger security purge: clear all active sessions for this admin.
  if (tokenIndex === -1) {
    admin.hashedRefreshTokens = [];
    await admin.save();
    throw new ForbiddenError("Potential session hijacking detected. All active session keys revoked. Please re-authenticate.");
  }

  // Rotate Tokens (Generation of fresh keys)
  const newAccessToken = generateAccessToken(admin);
  const newRefreshToken = generateRefreshToken(admin);

  // Swap tokens in DB
  admin.hashedRefreshTokens[tokenIndex] = hashToken(newRefreshToken);
  await admin.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const changeAdminPassword = async (adminId, oldPassword, newPassword) => {
  const admin = await Admin.findById(adminId).select("+password +hashedRefreshTokens");
  if (!admin) {
    throw new UnauthorizedError("Administrator record not found.");
  }

  const isMatch = await admin.comparePassword(oldPassword);
  if (!isMatch) {
    throw new UnauthorizedError("The current password entered is incorrect.");
  }

  // Set new password (will trigger the pre-save complexity checks & hashing)
  admin.password = newPassword;
  
  // Revoke all other sessions upon password change for security
  admin.hashedRefreshTokens = [];
  
  await admin.save();
};
