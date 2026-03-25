import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateSignUp, validateSignIn } from '../middleware/validation.middleware.js';
const router = Router();
/* Public Routes */
// Sign Up Route
router.post('/signUp', validateSignUp, authController.signUp.bind(authController));
// Sign In Route
router.post('/signIn', validateSignIn, authController.signIn.bind(authController));
/* Protected Routes */
// Will be useful for when we want to implement features that require authentication, such as fetching user profile, updating user details, etc.
// Example: Get User Profile (requires authentication)
// router.get('/profile', authenticateToken, authController.getProfile);
export default router;
