import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateSignUp, validateSignIn } from '../middleware/validation.middleware.js';
import authenticateToken from '../middleware/auth.middleware.js';
const router = Router();
/* Public Routes */
// Sign Up Route
router.post('/signUp', validateSignUp, authController.signUp.bind(authController));
// Sign In Route
router.post('/signIn', validateSignIn, authController.signIn.bind(authController));
// Backwards-compatible alias (client used /auth/login)
router.post('/login', validateSignIn, authController.signIn.bind(authController));

/* Protected Routes */
// Verify token validity — used by the frontend auth guard on page load
router.get('/verify', authenticateToken, authController.verify.bind(authController));
export default router;
