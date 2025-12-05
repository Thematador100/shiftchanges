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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, couponCode, addCoverLetter } = req.body;
    
    if (!packagePrices[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }
    
    if (!STRIPE_KEY) {
      return res.status(500).json({ error: "Stripe configuration missing on server." });
    }

    let originalPrice = packagePrices[plan];
    
    // Add cover letter price if selected (only for plans that don't include it)
    // Leadership/NP tier includes cover letter, so don't charge extra
    if (addCoverLetter && plan !== 'expert-clinical') {
      originalPrice += 7900; // $79 in cents
    }
    
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
      metadata: { 
        plan, 
        coupon: couponCode || 'NONE',
        cover_letter: addCoverLetter ? 'yes' : 'no',
        email: email || 'not_provided'
      }
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
