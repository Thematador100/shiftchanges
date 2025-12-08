# ShiftChange - Production Deployment Guide

This guide will walk you through deploying your fully functional ShiftChange application to production on Vercel.

---

## Prerequisites

Before you begin, ensure you have:

1. **GitHub Account** - Your code repository (already set up at `Thematador100/shiftchanges`)
2. **Vercel Account** - For hosting (sign up at [vercel.com](https://vercel.com))
3. **Stripe Account** - For payment processing (sign up at [stripe.com](https://stripe.com))
4. **Neon Database** - PostgreSQL database (already created with connection string)
5. **Google Gemini API Key** - For AI resume generation

---

## Step 1: Prepare Your Environment Variables

Your application requires the following environment variables to function. You will add these to Vercel.

### Required Environment Variables

| Variable Name | Description | Where to Get It |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL connection string | Your Neon dashboard |
| `JWT_SECRET` | Secret key for signing authentication tokens | Generate a random string (see below) |
| `API_KEY` | Google Gemini API key | Google AI Studio |
| `STRIPE_SECRET_KEY` | Stripe secret key (LIVE mode) | Stripe Dashboard > Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard > Developers > Webhooks |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (LIVE mode) | Stripe Dashboard > Developers > API Keys |
| `VITE_ADMIN_PASSWORD` | (Optional) Admin password for God Mode | Your choice |

### Generate a JWT_SECRET

Run this command in your terminal to generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and save it as your `JWT_SECRET`.

---

## Step 2: Configure Stripe (LIVE MODE)

### Get Your Live API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from **Test Mode** to **Live Mode** (top right)
3. Navigate to **Developers > API Keys**
4. Copy your:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

### Create a Webhook Endpoint

1. In Stripe Dashboard (LIVE MODE), go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://shiftchangess.vercel.app/api/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded` ✅
   - `payment_intent.payment_failed` ✅
   - `charge.refunded` ✅
5. Click **Add endpoint**
6. Click on the endpoint and copy the **Signing secret** (starts with `whsec_`)

---

## Step 3: Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for Non-Developers)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Select **Import Git Repository**
4. Search for and select `Thematador100/shiftchanges`
5. Click **Import**
6. In the **Environment Variables** section, add all the variables from Step 1
7. Click **Deploy**

Vercel will automatically detect the Vite framework and deploy your app.

### Option B: Deploy via Command Line

If you have the Vercel CLI installed:

```bash
vercel --prod
```

When prompted, add all environment variables.

---

## Step 5: Verify Deployment

After deployment completes:

1. **Visit your live URL** at `https://shiftchangess.vercel.app`
2. **Test the free features** (Critique, Job Match)
3. **Test a payment** with a small amount (e.g., $1) using Stripe test card: `4242 4242 4242 4242`
4. **Verify the webhook** by checking Stripe Dashboard > Developers > Webhooks > [Your Endpoint] > Logs
5. **Test the paid features** after payment succeeds

---

## Step 6: Monitor Your Application

### Check Logs

In Vercel Dashboard:
1. Go to your project
2. Click **Deployments**
3. Click on the latest deployment
4. Click **Logs** to view real-time logs

### Monitor Stripe Payments

In Stripe Dashboard:
1. Go to **Payments** to see all transactions
2. Go to **Developers > Webhooks** to verify webhook delivery
3. Go to **Balance > Payouts** to manage your funds

### Monitor Database

In Neon Dashboard:
1. Go to **SQL Editor** to run queries
2. Check the `user_access` table to see who has purchased

---

## Step 7: Going Live Checklist

Before accepting real payments, verify:

- [ ] All environment variables are set correctly in Vercel
- [ ] Stripe is in LIVE mode (not test mode)
- [ ] Webhook endpoint is created and verified in Stripe
- [ ] Test payment completes successfully
- [ ] User receives email receipt from Stripe
- [ ] User is instantly logged in after payment
- [ ] Paid features (Generate, Improve, Tailor, Cover Letter, Optimize Skills) work correctly
- [ ] Free features (Critique, Job Match) work without payment
- [ ] Database records are being created in Neon (`user_access` table)
- [ ] Admin password works for God Mode (if configured)

---

## Troubleshooting

### Issue: "Database Connection Failed"

**Solution:**
1. Verify `DATABASE_URL` is set in Vercel environment variables
2. Check that the Neon database is running
3. Ensure the `user_access` table exists (run the SQL setup query in Neon)

### Issue: "Invalid API Key" (Gemini)

**Solution:**
1. Verify `API_KEY` is set correctly in Vercel
2. Check that the key is from Google AI Studio (not Google Cloud)
3. Ensure the key has not been revoked

### Issue: "Webhook Signature Verification Failed"

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret in Stripe
2. Ensure the webhook was created in LIVE mode, not test mode
3. Check that the webhook URL is publicly accessible

### Issue: "Payment Succeeded but User Not Logged In"

**Solution:**
1. Check Stripe webhook logs to see if the event was received
2. Verify the `user_access` table was updated in Neon
3. Check browser console for errors in the `/api/get-auth-token` call

### Issue: "Paid Features Not Working"

**Solution:**
1. Verify the auth token is being stored in browser local storage
2. Check that the token is being passed with API requests
3. Verify `JWT_SECRET` is set in Vercel (must match the secret used to sign tokens)

---

## Pricing Configuration

Your current pricing tiers are defined in `api/create-payment-intent.js`:

```javascript
const packagePrices = {
  'fast-ai': 14900,        // $149.00
  'ai-target': 29900,      // $299.00
  'expert-clinical': 49900, // $499.00
  'leadership-np': 64900    // $649.00
};
```

**Note:** Prices are in cents (100 = $1.00).

To change pricing, edit this file and redeploy.

---

## Active Coupon Codes

The following coupon codes are active:

- `NURSE_HERO`: 10% off
- `BETA_TESTER_100`: 100% off (FREE)
- `DEMO_MODE`: 100% off (FREE)

To add or modify coupon codes, edit `components/Checkout.tsx` in the `handleApplyCoupon` function.

---

## Support & Monitoring

### Real-Time Monitoring

Set up error monitoring with **Sentry** (optional but recommended):

```bash
npm install @sentry/react @sentry/tracing
```

Then configure in your app to catch errors in production.

### Email Notifications

Users receive email receipts from Stripe automatically. To send custom emails:

1. Integrate SendGrid or AWS SES
2. Update `api/webhook.js` to send custom confirmation emails

---

## Next Steps

1. **Deploy to production** using the steps above
2. **Test thoroughly** with real payments
3. **Monitor logs** for any errors
4. **Collect feedback** from users
5. **Iterate** based on user feedback

---

## Important Security Notes

⚠️ **CRITICAL:**

- **Never commit `.env` files to Git** - Use Vercel's environment variable management
- **Keep `JWT_SECRET` secret** - This is used to sign authentication tokens
- **Keep `STRIPE_SECRET_KEY` secret** - This is used for sensitive payment operations
- **Rotate secrets regularly** - If you suspect a breach, regenerate all secrets immediately
- **Monitor webhook logs** - Ensure all payment events are being processed

---

## Questions?

For more information:

- **Vercel Docs:** https://vercel.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Google Gemini Docs:** https://ai.google.dev/docs

---

**Your application is now ready for production!** 🚀
