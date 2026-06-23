import logger from "../config/logger.js";
import { sendError } from "../utilities/responseFormatter.js";
import AppError from "../errors/AppError.js";

/**
 * Express Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Structured Log with Winston
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${err.stack}`);

  // Development vs Production response formatting
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else {
    sendProdError(err, res);
  }
};

const sendDevError = (err, res) => {
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    status: err.status,
    errors: err.errors || [],
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  // Operational, trusted error: send user-friendly message to client
  if (err.isOperational) {
    return sendError(res, err.message, err.errors || [], err.statusCode);
  }

  // Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return sendError(res, message, [], 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = "Invalid database input data.";
    return sendError(res, message, errors, 400);
  }

  // Zod Validation Error (From request parser schema matching)
  if (err.name === "ZodError" || err.issues) {
    const errors = err.issues ? err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) : [err.message];
    const message = "Validation failed for request input.";
    return sendError(res, message, errors, 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid secure session token. Please login again.", [], 401);
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Your secure session token has expired. Please refresh session.", [], 401);
  }

  // Programming or other unknown errors: don't leak details
  return sendError(res, "An internal technical error occurred. Please contact administrator.", [], 500);
};

export default errorHandler;
