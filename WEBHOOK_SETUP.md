# Stripe Webhook Setup Guide

This guide will help you configure Stripe webhooks to ensure payments are properly recorded in your database and customers receive confirmation emails.

## Why Webhooks Are Important

Webhooks are how Stripe notifies your server when a payment succeeds. Without webhooks:
- ❌ Payments won't be recorded in your database
- ❌ You won't know when customers make purchases
- ❌ Customers won't receive confirmation emails
- ❌ Access won't be automatically granted

## Setup Steps

### 1. Deploy Your Application

First, deploy your application to a production server (Vercel, Netlify, etc.) so you have a public URL.

Example: `https://shiftchange.com`

### 2. Configure Webhook in Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   ```
   https://shiftchangess.vercel.app/api/webhook
   ```

5. Select events to listen for:
   - ✅ `payment_intent.succeeded`

6. Click **Add endpoint**

### 3. Get Your Webhook Signing Secret

After creating the webhook:

1. Click on the webhook you just created
2. Click **Reveal** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

### 4. Add Secret to Environment Variables

Add the webhook secret to your `.env` file or deployment environment:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Test the Webhook

1. In Stripe Dashboard, go to your webhook
2. Click **Send test webhook**
3. Select `payment_intent.succeeded`
4. Click **Send test webhook**
5. Check that you receive a `200 OK` response

## Environment Variables Checklist

Make sure all these are set in your production environment:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Database
DATABASE_URL=postgresql://...

# SendGrid (for emails)
SENDGRID_API_KEY=SG.5712D6S8X8JEU8MQTUZULCTW
FROM_EMAIL=noreply@shiftchangess.vercel.app

# Application
APP_URL=https://shiftchangess.vercel.app
VITE_ADMIN_PASSWORD=shiftchange2025

# API Keys
API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

## Testing Payment Flow

### Test Mode (Development)

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any ZIP code

### What Should Happen

After successful payment:
1. ✅ Customer sees thank you page
2. ✅ Customer redirected to resume editor after 5 seconds
3. ✅ Payment recorded in database
4. ✅ Confirmation email sent to customer
5. ✅ You can see the order in admin dashboard

## Troubleshooting

### Webhook Returns 401 Unauthorized

- Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify the secret matches what's in Stripe Dashboard

### Webhook Returns 500 Error

- Check server logs for detailed error message
- Verify `DATABASE_URL` is set and database is accessible
- Ensure `SENDGRID_API_KEY` is valid (emails will fail silently)

### Customer Doesn't Receive Email

- Verify `SENDGRID_API_KEY` is correct
- Check SendGrid dashboard for delivery status
- Verify `FROM_EMAIL` is a verified sender in SendGrid

### Payment Succeeds But Access Not Granted

- Check webhook logs in Stripe Dashboard
- Verify webhook is receiving `payment_intent.succeeded` events
- Check your server logs for database errors

## Admin Dashboard Access

Access the admin dashboard at:
```
https://shiftchangess.vercel.app/admin
```

Password: The value of `VITE_ADMIN_PASSWORD` environment variable

## Support

If you encounter issues:
1. Check Stripe webhook logs in Dashboard
2. Check your server logs
3. Verify all environment variables are set
4. Test with Stripe test mode first

## Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Use different keys for test and production
- ⚠️ Keep webhook signing secret secure
- ⚠️ Change admin password from default
