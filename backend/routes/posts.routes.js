import { Router } from 'express';
import PostsController from '../controllers/posts.controller.js';
import { validatePost } from '../middleware/validation.middleware.js';
import authenticateToken, { authenticateTokenOptional } from '../middleware/auth.middleware.js';

const router = Router();

/* Public Routes */
router.get('/', PostsController.getAll);
router.get('/slug/:hex', authenticateTokenOptional, PostsController.getOneByHex);
router.get('/:id', PostsController.getOne);

/* Protected Routes */
router.post('/', authenticateToken, validatePost, PostsController.create);
router.put('/:id', authenticateToken, validatePost, PostsController.update);

export default router;
