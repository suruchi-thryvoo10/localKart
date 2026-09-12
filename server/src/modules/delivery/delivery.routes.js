import { Router } from 'express';
import * as deliveryController from './delivery.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, requireRoles('DELIVERY_AGENT', 'ADMIN'));

router.get('/dashboard', deliveryController.getAgentDashboard);
router.post('/orders/:orderId/pickup', deliveryController.pickupOrder);
router.post('/orders/:orderId/deliver', deliveryController.completeDelivery);
router.get('/history', deliveryController.getDeliveryHistory);

export default router;
