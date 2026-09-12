import { Router } from 'express';
import * as ordersController from './orders.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Customer endpoints
router.post('/', ordersController.createOrder);
router.get('/my-orders', ordersController.getCustomerOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/:id/cancel', ordersController.cancelOrderCustomer);

// Vendor endpoints
router.get('/vendor/all', requireRoles('VENDOR', 'ADMIN'), ordersController.getVendorOrders);

// Status update (Vendor, Delivery Agent, Admin)
router.patch('/:id/status', requireRoles('VENDOR', 'DELIVERY_AGENT', 'ADMIN'), ordersController.updateOrderStatus);

export default router;
