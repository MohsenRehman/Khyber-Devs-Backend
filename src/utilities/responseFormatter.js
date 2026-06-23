/**
 * Formats API success response uniformly.
 * @param {object} res - Express response object
 * @param {string} message - User-friendly message
 * @param {object|array} data - Returned payload
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Formats API error response uniformly.
 * @param {object} res - Express response object
 * @param {string} message - User-friendly error summary
 * @param {array} errors - Detailed list of errors (e.g., validation rules)
 * @param {number} statusCode - HTTP status code
 */
export const sendError = (res, message, errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};
