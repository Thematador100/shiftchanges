import Stripe from 'stripe';
import { grantUserAccess } from '../services/dbService.js';
import { generateAuthToken } from '../services/authService.js';

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

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // CRITICAL: Grant user access to the purchased plan
      const userEmail = paymentIntent.receipt_email;
      const purchasedPlan = paymentIntent.metadata.plan;
      
      if (userEmail && purchasedPlan) {
          try {
              await grantUserAccess(userEmail, purchasedPlan);
              console.log(`User access granted for ${userEmail} to plan ${purchasedPlan}`);
              
              // Generate an auth token for the user
              const authToken = generateAuthToken(userEmail, purchasedPlan);
              console.log(`Auth token generated for ${userEmail}`);
              
              // TODO: Send confirmation email with the auth token
              // This would typically be done via a service like SendGrid or AWS SES
              // The email should instruct the user to paste the token in the app to unlock features
          } catch (dbError) {
              console.error(`Failed to grant access for ${userEmail}:`, dbError);
          }
      } else {
          console.error('Missing email or plan in payment intent metadata.');
      }
      
      // Add your business logic here (e.g., send confirmation email)
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}
