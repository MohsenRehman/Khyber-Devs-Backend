import * as authService from "../services/auth.service.js";
import { loginSchema, changePasswordSchema } from "../validations/auth.validation.js";
import { sendSuccess } from "../utilities/responseFormatter.js";
import { BadRequestError } from "../errors/BadRequestError.js";

const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days in ms
  };
};

export const login = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new BadRequestError("Invalid inputs for login.", validation.error.issues);
    }

    const { email, password } = validation.data;
    const ipAddress = req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || "127.0.0.1";
    const userAgent = req.headers["user-agent"];

    // 2. Execute Auth Service
    const { admin, accessToken, refreshToken } = await authService.loginAdmin(
      email,
      password,
      ipAddress,
      userAgent
    );

    // 3. Set Refresh Token as HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    return sendSuccess(res, "Administrator authentication successful.", { admin, accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await authService.logoutAdmin(req.user._id, refreshToken);
    }

    // Clear client Cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return sendSuccess(res, "Administrator logout completed successfully.");
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    const { accessToken, refreshToken } = await authService.refreshSession(token);

    // Set new rotated Refresh Token in Cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    return sendSuccess(res, "Secure session token successfully rotated.", { accessToken });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      throw new BadRequestError("Invalid password change parameters.", validation.error.issues);
    }

    const { oldPassword, newPassword } = validation.data;

    // 2. Service execution
    await authService.changeAdminPassword(req.user._id, oldPassword, newPassword);

    // 3. Clear Cookie (forces full re-login across this browser device)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return sendSuccess(res, "Password updated successfully. Session keys revoked.");
  } catch (error) {
    next(error);
  }
};
