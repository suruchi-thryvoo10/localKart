import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';
import { config } from '../config/index.js';

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, null, 'ERR_NOT_FOUND');
};

export const globalErrorHandler = (err, req, res, next) => {
  logger.error('Unhandled Exception Caught:', {
    message: err.message,
    stack: config.isProduction ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found with id ${err.value}`, 404, null, 'ERR_INVALID_ID');
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return errorResponse(res, `${field} already exists with value '${err.keyValue[field]}'`, 409, null, 'ERR_DUPLICATE_KEY');
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return errorResponse(res, 'Validation Error', 422, errors, 'ERR_VALIDATION');
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401, null, 'ERR_INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401, null, 'ERR_TOKEN_EXPIRED');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = config.isProduction && statusCode === 500 ? 'Internal Server Error' : err.message;

  return errorResponse(res, message, statusCode, null, err.code || 'ERR_INTERNAL_SERVER');
};
