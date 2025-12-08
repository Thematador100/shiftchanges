# Stripe Production Setup Guide

## Overview
Your ShiftChange application is ready for production Stripe payments. This guide will help you switch from test mode to **LIVE PAYMENTS** that charge real credit cards.

---

## Step 1: Get Your Production API Keys

### 1.1 Access Your Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Toggle from **Test Mode** to **Live Mode** (switch in top right)
3. **IMPORTANT**: Make sure "Live" is selected (not "Test")

### 1.2 Get Your Live API Keys
Navigate to: **Developers > API Keys**

You need **THREE** keys:

#### A. Publishable Key (Frontend)
- Format: `pk_live_...`
- This is public and safe to expose in your frontend code
- Used by: `Checkout.tsx`

#### B. Secret Key (Backend)
- Format: `sk_live_...`
- **CRITICAL**: Never expose this in frontend code or commit to Git
- Used by: `create-payment-intent.js`

#### C. Webhook Secret (Backend)
- Format: `whsec_...`
- You'll get this in Step 2 when you create the webhook endpoint
- Used by: `webhook.js`

---

## Step 2: Configure Environment Variables

### 2.1 For Development (.env.local)
Create or update `.env.local`:

```bash
# PRODUCTION STRIPE KEYS (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

### 2.2 For Production (Vercel/Your Host)

#### If using Vercel:
```bash
vercel env add STRIPE_SECRET_KEY
# Paste: sk_live_...

vercel env add STRIPE_WEBHOOK_SECRET
# Paste: whsec_...

vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# Paste: pk_live_...
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all three keys for **Production** environment

#### If using other hosting:
Set these environment variables in your hosting platform's dashboard or deployment configuration.

---

## Step 3: Set Up Production Webhook

### 3.1 Create Webhook Endpoint
1. In Stripe Dashboard (LIVE MODE): **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your production URL:
   ```
   https://shiftchangess.vercel.app/api/webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded` ✅ (Already handled)
   - `payment_intent.payment_failed` (Recommended)
   - `charge.refunded` (Recommended)

5. Click **Add endpoint**

### 3.2 Get Your Webhook Secret
1. After creating the endpoint, click on it
2. Click **Reveal** under "Signing secret"
3. Copy the `whsec_...` value
4. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 4: Update Pricing (If Needed)

Your current pricing in `create-payment-intent.js`:
```javascript
const packagePrices = {
  'fast-ai': 14900,        // $149.00
  'ai-target': 29900,      // $299.00
  'expert-clinical': 49900, // $499.00
  'leadership-np': 64900    // $649.00
};
```

**Note**: Prices are in cents (100 = $1.00). These match your frontend display prices.

---

## Step 5: Test Production Integration

### 5.1 Pre-Deployment Checklist
- [ ] All three environment variables are set with `pk_live_`, `sk_live_`, and `whsec_` keys
- [ ] `.env.local` is in your `.gitignore` (NEVER commit secrets)
- [ ] Webhook endpoint is created and verified in Stripe Dashboard
- [ ] Stripe Dashboard is in **LIVE MODE** (not test mode)

### 5.2 Deploy to Production
```bash
# Push your code (environment variables should already be configured)
git push origin main

# If using Vercel
vercel --prod
```

### 5.3 Test a Real Payment

⚠️ **WARNING**: This will charge a REAL credit card!

1. Visit your production site
2. Select a package
3. Enter REAL payment details
4. Complete purchase
5. Verify:
   - Payment appears in Stripe Dashboard (LIVE MODE) under **Payments**
   - Webhook event received (check **Developers > Webhooks > [Your endpoint] > Logs**)
   - User receives confirmation

### 5.4 Test with Small Amount First
Consider temporarily changing one package to $1.00 for initial testing:
```javascript
'fast-ai': 100, // $1.00 for testing
```

---

## Step 6: Security Best Practices

### ✅ Already Implemented
- ✅ Webhook signature verification (`webhook.js:33`)
- ✅ Server-side price calculation (prevents client tampering)
- ✅ CORS configured properly
- ✅ Environment variables for secrets

### 🔒 Additional Recommendations

1. **Monitor for fraud**:
   - Enable Stripe Radar in Dashboard > Radar
   - Review declined payments regularly

2. **Set up email receipts**:
   - Already configured via `receipt_email` in `create-payment-intent.js:61`
   - Customers will automatically receive Stripe receipts

3. **Add error monitoring**:
   ```bash
   npm install @sentry/nextjs
   ```
   Or use your preferred error tracking service

4. **Backup webhook events**:
   - Stripe Dashboard > Developers > Events
   - Shows all events for 30 days
   - Consider storing critical events in your database

---

## Step 7: Going Live Checklist

Before you start accepting real payments:

- [ ] Test mode works perfectly
- [ ] All three LIVE API keys are configured
- [ ] Webhook endpoint is receiving events in production
- [ ] Test transaction completes successfully (use small amount)
- [ ] Customer receives email receipt
- [ ] Payment appears in Stripe Dashboard
- [ ] Refund process tested (optional but recommended)
- [ ] Business is activated in Stripe (no "business verification pending" warnings)
- [ ] Bank account connected for payouts (Stripe > Balance > Payouts)

---

## Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution**: Make sure you're using `sk_live_` not `sk_test_`

### Issue: "Webhook signature verification failed"
**Solution**:
1. Check `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret
2. Verify you created the webhook in LIVE mode, not test mode

### Issue: "No such payment_intent"
**Solution**: You might be mixing test and live keys. Ensure ALL keys are from LIVE mode.

### Issue: Payments work but webhook doesn't fire
**Solution**:
1. Check webhook URL is publicly accessible (not localhost)
2. View webhook logs in Stripe Dashboard
3. Ensure webhook endpoint exists in LIVE mode

---

## Monitoring Production Payments

### Stripe Dashboard (LIVE MODE)
- **Payments**: See all successful transactions
- **Balance**: View available funds and payout schedule
- **Customers**: Manage customer records
- **Webhooks**: Monitor webhook delivery and debug failures

### Webhook Event Handling
Your current webhook handler logs to console. Consider:
```javascript
// In webhook.js, add business logic:
case 'payment_intent.succeeded':
  const paymentIntent = event.data.object;

  // 1. Store in database
  await db.savePayment({
    stripeId: paymentIntent.id,
    email: paymentIntent.receipt_email,
    plan: paymentIntent.metadata.plan,
    amount: paymentIntent.amount
  });

  // 2. Send custom confirmation email
  await sendConfirmationEmail(paymentIntent.receipt_email);

  // 3. Grant access to user account
  await activateUserAccess(paymentIntent.receipt_email, paymentIntent.metadata.plan);
  break;
```

---

## Pricing Packages Summary

Your current tiers:
| Package | Price | Code Name |
|---------|-------|-----------|
| Fast Track | $149 | `fast-ai` |
| Targeted | $299 | `ai-target` |
| Specialist | $499 | `expert-clinical` |
| Executive | $649 | `leadership-np` |

Active coupon codes:
- `NURSE_HERO`: 10% off
- `BETA_TESTER_100`: 100% off (FREE)
- `DEMO_MODE`: 100% off (FREE)

---

## Need Help?

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Webhook Locally**: Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhook`)

---

## Summary: What Changes for Production?

**What DOES change:**
- Environment variables (test keys → live keys)
- Stripe Dashboard mode (Test → Live)
- Real money is charged

**What DOESN'T change:**
- Your code (already production-ready!)
- Package prices
- Coupon codes
- User experience

Your integration is solid. Just swap the keys and you're ready to accept real payments! 🚀
