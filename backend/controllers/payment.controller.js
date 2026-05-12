import Stripe from 'stripe';
import pool from './database.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class PaymentController {
    static async createSubscriptionCheckout(req, res, next) {
        try {
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                customer_email: req.user.email,
                line_items: [
                    {
                        price: process.env.STRIPE_PRICE_ID,
                        quantity: 1
                    }
                ],
                metadata: {
                    userId: String(req.user.id)
                },
                subscription_data: {
                    metadata: {
                        userId: String(req.user.id)
                    }
                },
                success_url: `${process.env.CLIENT_URL}/payment-success.html`,
                cancel_url: `${process.env.CLIENT_URL}/payment-cancel.html`
            });

            res.status(200).json({
                success: true,
                url: session.url
            });
        } catch (error) {
            console.error('Stripe checkout error:', error);
            next(error);
        }
    }

    static async stripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            console.error('Webhook error:', error.message);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.userId;

            await pool.query(
                `UPDATE users
                 SET is_subscribed = TRUE,
                     subscription_status = 'active',
                     stripe_customer_id = $1
                 WHERE userid = $2`,
                [session.customer, userId]
            );

            console.log(`Subscription activated for user ${userId}`);
        }

        res.json({ received: true });
    }
}

export default PaymentController;