import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';
import { config } from '../config/index.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isTest ? 10000 : 300, // Max requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many requests from this IP address, please try again after 15 minutes.',
      429,
      null,
      'ERR_RATE_LIMIT_EXCEEDED'
    );
  },
  skip: (req) => config.isTest,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isTest ? 10000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many login attempts, please try again in 15 minutes.',
      429,
      null,
      'ERR_AUTH_RATE_LIMIT'
    );
  },
  skip: (req) => config.isTest,
});
