import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.post('/addresses', usersController.addAddress);
router.put('/addresses/:addressId', usersController.updateAddress);
router.delete('/addresses/:addressId', usersController.deleteAddress);
router.patch('/addresses/:addressId/default', usersController.setDefaultAddress);

export default router;
