import Stripe from 'stripe';

const STRIPE_KEY = (process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = new Stripe(STRIPE_KEY);

const packagePrices = {
  'fast-ai': 14900,
  'ai-target': 29900,
  'expert-clinical': 49900,
  'leadership-np': 64900
};

const VALID_COUPONS = {
  'NURSE_HERO': 10,
  'BETA_TESTER_100': 100,
  'DEMO_MODE': 100
};

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 payment requests per minute per IP

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRecord = rateLimitStore.get(identifier);

  if (!userRecord) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > userRecord.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userRecord.count++;
  return true;
}

// Email validation
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export default async function handler(req, res) {
  // Enable CORS - TODO: Replace '*' with your actual domain in production (e.g., 'https://yoursite.vercel.app')
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const identifier = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(identifier)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { plan, email, couponCode } = req.body;

    // Input validation
    if (!plan || typeof plan !== 'string') {
      return res.status(400).json({ error: 'Invalid request: plan is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!packagePrices[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    if (couponCode && typeof couponCode !== 'string') {
      return res.status(400).json({ error: 'Invalid coupon code format' });
    }

    if (!STRIPE_KEY) {
      return res.status(500).json({ error: "Stripe configuration missing on server." });
    }

    let originalPrice = packagePrices[plan];
    let finalAmount = originalPrice;

    if (couponCode && VALID_COUPONS[couponCode.toUpperCase()]) {
      const discountPercent = VALID_COUPONS[couponCode.toUpperCase()];
      finalAmount = Math.max(0, originalPrice - Math.round(originalPrice * (discountPercent / 100)));
    }

    if (finalAmount === 0) {
      return res.status(200).json({ isFree: true, message: "100% off applied" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: { plan, coupon: couponCode || 'NONE' }
    });

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret, 
      amount: finalAmount 
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
}
