import Stripe from 'stripe';
import pool from './database.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class PaymentController {
    //Create a Stripe Checkout session for the logged-in user's subscription
    static async createSubscriptionCheckout(req, res, next) {
        try {
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                customer_email: req.user.email,
                line_items: [
                    {
                        // Stripe price ID identifies the subscription plan configured in Stripe
                        price: process.env.STRIPE_PRICE_ID,
                        quantity: 1
                    }
                ],
                //Store the app user ID so the webhook can link Stripe's event back to this account
                metadata: {
                    userId: String(req.user.id)
                },
                subscription_data: {
                    metadata: {
                        userId: String(req.user.id)
                    }
                },
                // WORKS TAKES TO THIS PAGE
                success_url: `${process.env.CLIENT_URL}/payment-success.html`,

                // DOESNT WORK TAKE TO THIS PAGE
                cancel_url: `${process.env.CLIENT_URL}/payment-cancel.html`,
                
                // CHEK THE STRIPE TRANSACTION SESSION
                // AUTOMATICALLY 24HRS NOW - 30 mins
                expires_at: Math.floor(Date.now() /1000) + (30*60)
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

    //Handle Stripe webhook events and update local subscription state after payment succeeds
    static async stripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            //Verify the webhook signature before trusting the event payload
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

            //Mark the user as subscribed once Stripe confirms checkout completion
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