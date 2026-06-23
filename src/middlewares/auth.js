import { verifyAccessToken } from "../utilities/jwt.js";
import Admin from "../models/Admin.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

/**
 * Middleware to authenticate requests using JWT Access Tokens
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new UnauthorizedError("Access denied. No secure session token provided."));
  }

  try {
    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Check if admin still exists
    const currentAdmin = await Admin.findById(decoded.id);
    if (!currentAdmin) {
      return next(new UnauthorizedError("The administrator belonging to this session token no longer exists."));
    }

    // 4. Check if user is locked or suspended
    if (currentAdmin.status === "suspended") {
      return next(new ForbiddenError("Your administrative account has been suspended."));
    }
    if (currentAdmin.status === "locked" && currentAdmin.lockedUntil > Date.now()) {
      return next(new ForbiddenError("Your account is locked due to security protocols. Please try again later."));
    }

    // 5. Grant access & bind admin to request
    req.user = currentAdmin;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid or expired session token. Please authenticate again."));
  }
};

/**
 * Middleware to restrict route access to specific roles
 * @param {...string} roles - Permitted user roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Access denied. You do not possess the required privilege level."));
    }
    next();
  };
};
