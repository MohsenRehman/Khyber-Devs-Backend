import jwt from "jsonwebtoken";

/**
 * Generates a short-lived access token.
 * @param {object} admin - Admin database document
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      email: admin.email,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
    }
  );
};

/**
 * Generates a long-lived refresh token.
 * @param {object} admin - Admin database document
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    }
  );
};

/**
 * Verifies JWT Access Token.
 * @param {string} token - Access Token string
 * @returns {object} Token payload if valid
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verifies JWT Refresh Token.
 * @param {string} token - Refresh Token string
 * @returns {object} Token payload if valid
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
