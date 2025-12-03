# Stripe Production Setup Guide

## Current Status

✅ **Your Stripe integration code is production-ready**
⚠️ **You need to replace placeholder API keys with real Stripe keys**

## What You Have Now

Your `.env.local` file contains placeholders:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

These are **not real keys** - they're placeholders that need to be replaced.

---

## Step 1: Get Your Live Stripe API Keys

### A. Create/Access Your Stripe Account
1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Complete account verification (required for live payments)

### B. Switch to Live Mode
1. In the Stripe Dashboard, look for the toggle in the top-right corner
2. Switch from **Test Mode** to **Live Mode**

### C. Get Your Live API Keys
1. Click **Developers** → **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) - Click "Reveal live key token"

**IMPORTANT:**
- Never share your secret key
- Never commit it to git
- Only use it in secure environment variables

---

## Step 2: Configure Keys for Production Deployment

### For Vercel Deployment

When you deploy to Vercel (see DEPLOY_NOW.md), add these environment variables in the Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Add these variables:

```
STRIPE_SECRET_KEY = sk_live_XXXXXXXXXXXXXXXX  (your actual live secret key)
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_XXXXXXXXXXXXXXXX  (your actual live publishable key)
STRIPE_WEBHOOK_SECRET = whsec_XXXXXXXXXXXXXXXX  (see Step 3 below)
```

4. Redeploy: `vercel --prod`

---

## Step 3: Set Up Production Webhooks

Webhooks notify your app when payments succeed.

### A. Create Production Webhook Endpoint

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL + `/api/webhook`:
   ```
   https://your-site.vercel.app/api/webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**

### B. Get Webhook Secret

1. Click on your newly created webhook
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 4: Test Live Payments

### Important: Use Real Payment Methods in Live Mode

In **Live Mode**, you cannot use test card numbers. You must use:
- Real credit cards
- Real bank accounts
- Or test with a small amount using your own card ($0.50 to verify)

### Recommended Testing Approach

1. **Before going live:**
   - Test thoroughly in **Test Mode** first
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

2. **When ready for live:**
   - Make a small real purchase yourself ($1.49 for Fast Track plan)
   - Verify the payment appears in Stripe Dashboard
   - Check webhook fired successfully
   - Then enable for real customers

---

## Your Current Pricing

Already configured in `api/create-payment-intent.js`:

| Package | Price |
|---------|-------|
| Fast Track | $149 |
| Targeted | $299 |
| Specialist | $499 |
| Executive | $649 |

### Active Coupons
- `NURSE_HERO` - 10% off
- `BETA_TESTER_100` - 100% off (free)
- `DEMO_MODE` - 100% off (free)

---

## Security Checklist Before Launch

- [ ] Stripe account fully verified
- [ ] Live API keys added to Vercel (NOT in code)
- [ ] Webhook endpoint configured with HTTPS
- [ ] Webhook secret added to environment variables
- [ ] Test payment successful in live mode
- [ ] Verify no API keys in git repository
- [ ] Consider removing 100% off coupons for production

---

## What Happens When Someone Pays

### Current Flow (Code Already Implemented)

1. **User selects package** → Frontend sends request to `/api/create-payment-intent`
2. **Payment Intent created** → Stripe generates `clientSecret`
3. **User enters payment** → Stripe processes payment
4. **Payment succeeds** → Stripe sends webhook to `/api/webhook`
5. **Your webhook handler** → Currently just logs success

### What's Missing (From COMMERCIAL_READINESS_REPORT.md)

Your webhook handler needs to:
- Grant user access to premium features
- Send confirmation email
- Record purchase in database
- Update user account status

**Current webhook code:**
```javascript
case 'payment_intent.succeeded':
  const paymentIntent = event.data.object;
  console.log('Payment succeeded:', paymentIntent.id);
  // Add your business logic here (e.g., send confirmation email)
  break;
```

---

## Quick Start Summary

**To accept real payments:**

1. Get live Stripe keys from https://dashboard.stripe.com (Live Mode)
2. Add them to Vercel environment variables:
   - `STRIPE_SECRET_KEY` = your `sk_live_` key
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your `pk_live_` key
3. Set up production webhook endpoint
4. Add `STRIPE_WEBHOOK_SECRET` to Vercel
5. Deploy: `vercel --prod`
6. Test with a small real payment

**Your Stripe integration code is ready** - you just need the real API keys and deployment.

---

## Support Resources

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Test Card Numbers: https://stripe.com/docs/testing
- Webhook Testing: https://dashboard.stripe.com/webhooks

---

## Current Limitations

From your COMMERCIAL_READINESS_REPORT.md, before commercial launch you should:

1. **Add user account system** - Currently no way to track who paid
2. **Implement webhook business logic** - Grant access after payment
3. **Add email confirmation** - Send receipt and access instructions
4. **Set up database** - Record transactions and user access
5. **Remove demo coupons** - `BETA_TESTER_100` and `DEMO_MODE` give 100% off

**The payment processing works, but you need to build what happens AFTER the payment.**
