import Stripe from 'stripe';

const STRIPE_KEY = (process.env.STRIPE_SECRET_KEY || '').trim();
const WEBHOOK_SECRET = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

const stripe = new Stripe(STRIPE_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate webhook configuration
  if (!WEBHOOK_SECRET) {
    console.error('Webhook Error: STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let buf;
  try {
    buf = await buffer(req);
  } catch (err) {
    console.error('Webhook Error: Failed to read request body:', err.message);
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('Webhook Error: Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          email: paymentIntent.receipt_email,
          plan: paymentIntent.metadata?.plan,
          coupon: paymentIntent.metadata?.coupon
        });

        // TODO: Implement business logic
        // 1. Store transaction in database
        // 2. Grant user access to paid features based on plan
        // 3. Send confirmation email with access instructions
        // 4. Log purchase for analytics

        // Example structure for future implementation:
        // await database.createPurchase({
        //   stripePaymentIntentId: paymentIntent.id,
        //   email: paymentIntent.receipt_email,
        //   plan: paymentIntent.metadata?.plan,
        //   amount: paymentIntent.amount,
        //   coupon: paymentIntent.metadata?.coupon,
        //   purchasedAt: new Date()
        // });
        // await emailService.sendPurchaseConfirmation(paymentIntent.receipt_email, paymentIntent.metadata?.plan);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', {
          id: paymentIntent.id,
          email: paymentIntent.receipt_email,
          error: paymentIntent.last_payment_error?.message
        });

        // TODO: Implement failure handling
        // 1. Log failed payment attempt
        // 2. Send notification email to user with retry instructions
        // 3. Alert admin if multiple failures from same user

        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        console.warn('Payment dispute created:', {
          id: dispute.id,
          amount: dispute.amount,
          reason: dispute.reason
        });

        // TODO: Handle disputes
        // 1. Alert admin immediately
        // 2. Suspend user access if needed
        // 3. Gather evidence for dispute response

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return res.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Stripe from retrying
    // Log the error for manual investigation
    return res.json({ received: true, error: 'Processing failed' });
  }
}
