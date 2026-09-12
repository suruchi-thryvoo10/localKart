import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';

const router = Router();

router.get('/', categoriesController.getCategories);
router.post('/', authenticate, requireRoles('ADMIN'), categoriesController.createCategory);
router.put('/:id', authenticate, requireRoles('ADMIN'), categoriesController.updateCategory);

export default router;
