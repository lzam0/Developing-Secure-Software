import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateSignUp, validateSignIn} from '../middleware/validation.middleware.js';
import authenticateToken from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';
const router = Router();

//auth limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many authentication attempts from your IP, please try again after 15 minutes'
});

/* Public Routes */
// apply the rate limiting middleware to the sign in and sign up routes
router.post('/signUp', authLimiter, validateSignUp, authController.signUp.bind(authController));
router.post('/signIn', authLimiter, validateSignIn, authController.signIn.bind(authController));
router.post('/login', authLimiter, validateSignIn, authController.signIn.bind(authController));
router.post('/verify-otp', authController.verifyOtp.bind(authController));


/* Protected Routes */
// Verify token validity — used by the frontend auth guard on page load
router.get('/verify', authenticateToken, authController.verify.bind(authController));
export default router;
