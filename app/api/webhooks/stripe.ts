import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../../services/supabase';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

if (!webhookSecret) {
  throw new Error('Stripe webhook secret is not configured');
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ message: 'No signature found' });
  }

  let event: Stripe.Event;
  const buf = await buffer(req);
  const rawBody = buf.toString('utf8');

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ message: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        if (!('metadata' in customer)) {
          throw new Error('Customer metadata not found');
        }
        const userId = customer.metadata.userId;

        if (!userId) {
          throw new Error('No user ID found in customer metadata');
        }

        // Update subscription status in database
        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          status: subscription.status,
          plan: subscription.items.data[0].price.nickname,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        if (!('metadata' in customer)) {
          throw new Error('Customer metadata not found');
        }
        const userId = customer.metadata.userId;

        if (!userId) {
          throw new Error('No user ID found in customer metadata');
        }

        // Update subscription status in database
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription as string;

        // Update last payment date in database
        const { error } = await supabase
          .from('subscriptions')
          .update({
            last_payment_date: new Date().toISOString(),
            payment_failed: false,
            last_payment_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription);

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription as string;

        // Update payment failure status in database
        const { error } = await supabase
          .from('subscriptions')
          .update({
            payment_failed: true,
            last_payment_error:
              (invoice as any).last_payment_error?.message || 'Payment failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription);

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
