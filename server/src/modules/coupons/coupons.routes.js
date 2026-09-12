import { Router } from 'express';
import * as couponsController from './coupons.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

router.get('/', couponsController.getActiveCoupons);
router.post('/', authenticate, requireRoles('ADMIN'), couponsController.createCoupon);
router.patch('/:id/toggle', authenticate, requireRoles('ADMIN'), couponsController.toggleCouponStatus);

export default router;
