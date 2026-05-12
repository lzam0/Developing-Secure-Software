import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';
import { validateCSRF } from '../middleware/csrf.middleware.js';

const router = Router();

router.post(
    '/create-subscription-checkout',
    authenticateToken,
    validateCSRF,
    PaymentController.createSubscriptionCheckout
);

export default router;