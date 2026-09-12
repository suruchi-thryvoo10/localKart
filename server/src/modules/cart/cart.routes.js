import { Router } from 'express';
import * as cartController from './cart.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items', cartController.updateCartItem);
router.delete('/', cartController.clearCart);
router.post('/apply-coupon', cartController.applyCoupon);

export default router;
