import { Router } from 'express';
import SecurityController from '../controllers/security.controller.js';

const router = Router();

router.get('/report-otp', SecurityController.reportSuspiciousOtp);

export default router;