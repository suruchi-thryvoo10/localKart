import { Router } from 'express';
import * as vendorsController from './vendors.controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

// Public routes
router.get('/nearby', optionalAuth, vendorsController.getNearbyVendors);
router.get('/:id', vendorsController.getVendorById);

// Vendor Protected routes
router.get('/me/profile', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.getMyVendorProfile);
router.put('/me/profile', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.updateVendorProfile);
router.patch('/me/toggle-open', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.toggleOpenStatus);
router.patch('/me/toggle-fresh', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.toggleFreshStockToday);
router.get('/me/dashboard', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.getVendorDashboardStats);
router.get('/me/delivery-agents', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.getVendorDeliveryAgents);
router.post('/me/delivery-agents', authenticate, requireRoles('VENDOR', 'ADMIN'), vendorsController.addDeliveryAgent);

export default router;
