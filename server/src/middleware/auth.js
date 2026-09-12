import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required', 401, null, 'ERR_UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Invalid token format', 401, null, 'ERR_UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, 'User account not found or deactivated', 401, null, 'ERR_USER_INACTIVE');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token has expired', 401, null, 'ERR_TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token', 401, null, 'ERR_INVALID_TOKEN');
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid optional auth token
  }
  next();
};
