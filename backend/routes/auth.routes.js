import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateSignUp, validateSignIn} from '../middleware/validation.middleware.js';
import { validateCSRF } from '../middleware/csrf.middleware.js';
import authenticateToken from '../middleware/auth.middleware.js';
import { requirePendingOtpSession } from '../middleware/otp-session.middleware.js';
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
router.post('/verify-otp', authLimiter, requirePendingOtpSession, authController.verifyOtp.bind(authController));


/* Protected Routes */
// Verify token validity — used by the frontend auth guard on page load
router.get('/verify', authenticateToken, authController.verify.bind(authController));
// Return profile data for the logged-in user — used by account.html on page load
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

// Change password route for logged-in users
router.patch('/password', authenticateToken, validateCSRF, authController.changePassword.bind(authController));
// Update name and username
router.patch('/profile', authenticateToken, validateCSRF, authController.updateProfile.bind(authController));
// Update email address
router.patch('/email', authenticateToken, validateCSRF, authController.updateEmail.bind(authController));
// Delete the logged-in user's account
router.delete('/account', authenticateToken, validateCSRF, authController.deleteAccount.bind(authController));

// Sign out route to revoke the current token
router.post('/signOut', authenticateToken, validateCSRF, authController.signOut.bind(authController));
export default router;
