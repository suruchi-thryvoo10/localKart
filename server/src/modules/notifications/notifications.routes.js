import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.getMyNotifications);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markOneRead);

export default router;
