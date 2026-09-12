import { Router } from 'express';
import * as paymentsController from './payments.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/simulate', paymentsController.processSimulatedPayment);
router.get('/history', paymentsController.getPaymentHistory);

export default router;
