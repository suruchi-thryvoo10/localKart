import { Router } from 'express';
import * as reviewsController from './reviews.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/vendor/:vendorId', reviewsController.getVendorReviews);
router.post('/', authenticate, reviewsController.createReview);

export default router;
