import { Router } from 'express';
import SecurityController from '../controllers/security.controller.js';

const router = Router();

// Handle suspicious OTP report links sent to users during verification flows
//The controller validates the one-time report token before cancelling any OTPs
router.get('/report-otp', SecurityController.reportSuspiciousOtp);

export default router;
