import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateSignUp, validateSignIn } from '../middleware/validation.middleware.js';
import authenticateToken from '../middleware/auth.middleware.js';
import { require_csrf } from '../middleware/csrf.middleware.js';
const router = Router();
/* Public Routes */
// Sign Up Route
router.post('/signUp', require_csrf, validateSignUp, authController.signUp.bind(authController));
// Sign In Route
router.post('/signIn', require_csrf, validateSignIn, authController.signIn.bind(authController));
// Backwards-compatible alias (client used /auth/login)
router.post('/login', require_csrf, validateSignIn, authController.signIn.bind(authController));

/* Protected Routes */
// Verify token validity — used by the frontend auth guard on page load
router.get('/verify', authenticateToken, authController.verify.bind(authController));

router.get('/csrf-token', authController.getCsrfToken.bind(authController));
export default router;
