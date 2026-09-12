import { body } from 'express-validator';
import { config } from '../../config/index.js';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(Object.values(config.roles))
    .withMessage(`Role must be one of: ${Object.values(config.roles).join(', ')}`),
  body('preferredLanguage')
    .optional()
    .isIn(config.supportedLanguages)
    .withMessage(`Language must be one of: ${config.supportedLanguages.join(', ')}`),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
