import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';
import { validateCSRF } from '../middleware/csrf.middleware.js';

const router = Router();

// Create a Stripe subscription checkout session for the currently signed-in user
router.post(
    '/create-subscription-checkout',
    //Require a valid auth token so the checkout session is tied to a real user account
    authenticateToken,
    // Require CSRF validation because this route starts a payment-related state change
    validateCSRF,
    PaymentController.createSubscriptionCheckout
);

// Confirm the returned Stripe Checkout session and activate the current user locally
router.post(
    '/confirm-subscription-checkout',
    authenticateToken,
    validateCSRF,
    PaymentController.confirmSubscriptionCheckout
);

export default router;
