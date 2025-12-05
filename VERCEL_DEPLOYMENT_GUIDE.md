# Vercel Deployment Guide - ShiftChange Platform

## Prerequisites

- GitHub account with the shiftchanges repository
- Vercel account (sign up at https://vercel.com)
- Stripe account with API keys
- SendGrid account with API key
- Neon database (already created)

---

## Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com and log in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **"Thematador100/shiftchanges"** from your GitHub repos
5. Click **"Import"**

---

## Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

Click **"Deploy"** but it will fail without environment variables - that's okay!

---

## Step 3: Add Environment Variables

Go to your project → **Settings** → **Environment Variables**

Add each of these variables (check all three environments: Production, Preview, Development):

### Required Variables:

#### Stripe Configuration
```
STRIPE_SECRET_KEY
Value: sk_live_... (or sk_test_... for testing)
```

```
STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (or pk_test_... for testing)
```

```
STRIPE_WEBHOOK_SECRET
Value: whsec_... (get this AFTER setting up webhook - see Step 5)
```

#### Database Configuration
```
DATABASE_URL
Value: postgresql://neondb_owner:npg_xsPdVInr2Q9c@ep-calm-sunset-ahzk9yf7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Email Configuration
```
SENDGRID_API_KEY
Value: SG.5712D6S8X8JEU8MQTUZULCTW
```

```
FROM_EMAIL
Value: noreply@yourdomain.com (must be verified in SendGrid)
```

#### Application Configuration
```
APP_URL
Value: https://yourdomain.com (or your Vercel URL: https://shiftchanges.vercel.app)
```

```
ADMIN_PASSWORD
Value: shiftchange2025 (or create your own secure password)
```

#### Gemini AI Configuration
```
GEMINI_API_KEY
Value: (your Gemini API key - check if you have this set up)
```

---

## Step 4: Redeploy After Adding Variables

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## Step 5: Set Up Stripe Webhook

**IMPORTANT: Do this AFTER your site is deployed!**

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhook
   ```
   (Replace with your actual domain or Vercel URL)

5. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

6. Click **"Add endpoint"**
7. Copy the **"Signing secret"** (starts with `whsec_...`)
8. Go back to Vercel → Settings → Environment Variables
9. Add/Update `STRIPE_WEBHOOK_SECRET` with the signing secret
10. Redeploy again

---

## Step 6: Verify SendGrid Email

1. Go to SendGrid Dashboard: https://app.sendgrid.com
2. Navigate to **Settings** → **Sender Authentication**
3. Choose one option:
   - **Domain Authentication** (recommended): Verify your entire domain
   - **Single Sender Verification**: Verify just one email address

4. Follow the verification steps
5. Update `FROM_EMAIL` in Vercel to match your verified email/domain
6. Redeploy if you changed the email

---

## Step 7: Test Your Deployment

### Test the Platform:
1. Visit your deployed URL
2. Click **"Start Your Transformation"**
3. Fill out the form and generate a resume
4. Try to purchase (use Stripe test card: `4242 4242 4242 4242`)
5. Verify you receive confirmation email
6. Check that payment appears in admin dashboard at `/admin`

### Test Admin Dashboard:
1. Go to `https://yourdomain.com/admin`
2. Enter password: `shiftchange2025` (or your custom password)
3. Verify you can see customer data

### Test Login System:
1. Click **"Log In"** on homepage
2. Enter an email that made a purchase
3. Check that login email is sent
4. Click the magic link in email
5. Verify you can access your resume

---

## Step 8: Custom Domain (Optional but Recommended)

1. In Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your custom domain (e.g., `shiftchange.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)
6. Update `APP_URL` environment variable to your custom domain
7. Update Stripe webhook URL to use custom domain
8. Redeploy

---

## Environment Variables Checklist

Use this checklist to make sure you have everything:

- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `DATABASE_URL`
- [ ] `SENDGRID_API_KEY`
- [ ] `FROM_EMAIL`
- [ ] `APP_URL`
- [ ] `ADMIN_PASSWORD`
- [ ] `GEMINI_API_KEY`

---

## Troubleshooting

### Deployment fails:
- Check build logs in Vercel
- Make sure all environment variables are set
- Verify Node.js version compatibility

### Payments not working:
- Check Stripe webhook is configured correctly
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook logs in Stripe dashboard

### Emails not sending:
- Verify SendGrid API key is correct
- Check sender email is verified in SendGrid
- Look at SendGrid activity logs

### Database errors:
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Test connection from Vercel functions

### Admin dashboard not accessible:
- Verify `ADMIN_PASSWORD` is set
- Clear browser cache and try again
- Check browser console for errors

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Stripe webhook logs
3. Check SendGrid activity logs
4. Check browser console for frontend errors
5. Review the `IMPLEMENTATION_SUMMARY.md` file in your repository

---

## Security Notes

- **Never commit** `.env` files to GitHub
- Keep your Stripe secret key secure
- Use strong passwords for admin access
- Enable Stripe webhook signature verification (already implemented)
- Regularly rotate API keys
- Use HTTPS only (Vercel provides this automatically)

---

## Next Steps After Deployment

1. Test all payment flows thoroughly
2. Send test emails to verify delivery
3. Create test customer accounts
4. Practice using admin dashboard
5. Set up monitoring/alerts in Vercel
6. Configure custom error pages (optional)
7. Set up analytics (optional)

---

**You're ready to launch! 🚀**
