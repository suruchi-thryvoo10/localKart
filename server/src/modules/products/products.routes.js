import { Router } from 'express';
import * as productsController from './products.controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

// Public / Customer routes
router.get('/', optionalAuth, productsController.getProducts);
router.get('/fresh-today', productsController.getFreshTodayProducts);
router.get('/:id', productsController.getProductById);

// Vendor / Admin routes
router.post('/', authenticate, requireRoles('VENDOR', 'ADMIN'), productsController.createProduct);
router.put('/:id', authenticate, requireRoles('VENDOR', 'ADMIN'), productsController.updateProduct);
router.patch('/:id/toggle-fresh', authenticate, requireRoles('VENDOR', 'ADMIN'), productsController.toggleProductFreshness);
router.patch('/:id/stock', authenticate, requireRoles('VENDOR', 'ADMIN'), productsController.updateStock);
router.delete('/:id', authenticate, requireRoles('VENDOR', 'ADMIN'), productsController.deleteProduct);

export default router;
