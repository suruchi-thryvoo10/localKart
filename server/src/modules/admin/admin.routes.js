import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/metrics', adminController.getPlatformMetrics);
router.get('/vendors', adminController.getAllVendors);
router.patch('/vendors/:id/status', adminController.updateVendorStatus);
router.get('/orders', adminController.getAllOrdersAdmin);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/settlements', adminController.getSettlements);
router.post('/settlements/generate', adminController.generateSettlement);

export default router;
