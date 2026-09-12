import { Router } from 'express';
import * as complaintsController from './complaints.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', complaintsController.createComplaint);
router.get('/my', complaintsController.getMyComplaints);
router.get('/admin/all', requireRoles('ADMIN'), complaintsController.getAllComplaintsAdmin);
router.patch('/admin/:id/resolve', requireRoles('ADMIN'), complaintsController.resolveComplaint);

export default router;
