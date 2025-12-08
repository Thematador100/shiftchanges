# ShiftChange - Quick Start Guide

Your application is now **fully functional and ready for production**. Here's what you need to do to go live.

---

## What's Been Implemented

✅ **Database Integration** - Neon PostgreSQL for storing user access records  
✅ **Secure Authentication** - JWT token-based system for seamless login  
✅ **Payment Processing** - Stripe integration for processing payments  
✅ **Paywall Enforcement** - Paid features require valid authentication  
✅ **Seamless User Experience** - Users are instantly logged in after payment  
✅ **AI Resume Features** - Google Gemini integration for all resume tools  

---

## User Journey (After Deployment)

1. **User visits your app** → Sees welcome screen with free features
2. **User clicks "Generate Resume"** → Redirected to checkout
3. **User enters email and pays** → Payment processed by Stripe
4. **User is instantly logged in** → Auth token stored locally
5. **User can now use all paid features** → Generate, Improve, Tailor, Cover Letter, Optimize Skills
6. **User returns tomorrow** → Automatically logged in with stored token

---

## What You Need to Do

### 1. Set Up Environment Variables (5 minutes)

You need to collect these keys and add them to Vercel:

| Key | Where to Get |
| :--- | :--- |
| `DATABASE_URL` | Your Neon connection string (you already have this) |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `API_KEY` | Google AI Studio (https://aistudio.google.com/app/apikey) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard (Live Mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard (Live Mode) |

### 2. Deploy to Vercel (2 minutes)

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your GitHub repository: `Thematador100/shiftchanges`
4. Add all environment variables from Step 1
5. Click **Deploy**

### 3. Set Up Stripe Webhook (2 minutes)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click **Add endpoint**
3. Enter: `https://shiftchangess.vercel.app/api/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

### 4. Test Your App (5 minutes)

1. Visit your live URL
2. Test a free feature (Critique or Job Match)
3. Try to use a paid feature (Generate) → Should redirect to checkout
4. Complete a test payment with card `4242 4242 4242 4242`
5. Verify you're instantly logged in and can use paid features

---

## Key Features

### Free Features (No Payment Required)
- **AI Critique** - Get feedback on your resume
- **Job Match Score** - See how well your resume matches a job

### Paid Features (Requires Payment)
- **Generate Resume** - Create a resume from scratch using AI
- **Improve Resume** - Enhance existing resume text
- **Tailor Resume** - Customize resume for specific job
- **Generate Cover Letter** - Create personalized cover letter
- **Optimize Skills** - Add high-impact ATS keywords

### Pricing Tiers
- **Fast Track** - $149
- **Targeted** - $299
- **Specialist** - $499
- **Executive** - $649

---

## How It Works Behind the Scenes

### Payment Flow
1. User enters email and selects plan
2. Stripe creates a payment intent
3. User completes payment
4. Stripe webhook notifies your backend
5. Backend grants user access in database
6. Frontend retrieves auth token using email
7. User is instantly logged in

### Authentication Flow
1. User logs in with auth token (stored locally)
2. Token is sent with every API request
3. Backend verifies token signature
4. Backend checks database for access
5. If valid, user can access paid features
6. If invalid, user is redirected to checkout

### Database
- **Table:** `user_access`
- **Columns:** `email`, `plan_tier`, `access_granted`, `created_at`
- **Purpose:** Track who has paid and what plan they purchased

---

## Troubleshooting

### Payment not working?
- Check Stripe is in LIVE mode (not test mode)
- Verify all Stripe keys are set in Vercel
- Check webhook logs in Stripe Dashboard

### User not logged in after payment?
- Verify `JWT_SECRET` is set in Vercel
- Check database: Is user record in `user_access` table?
- Check browser console for errors

### Paid features not working?
- Verify auth token is in browser local storage
- Check that token is being sent with API requests
- Verify `DATABASE_URL` is set in Vercel

---

## Next Steps

1. **Collect your API keys** (Google, Stripe, etc.)
2. **Deploy to Vercel** with environment variables
3. **Test thoroughly** with real payments
4. **Monitor logs** in Vercel and Stripe
5. **Launch publicly** and start accepting payments

---

## Support Resources

- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Vercel Docs:** https://vercel.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Neon Docs:** https://neon.tech/docs

---

**Your app is ready to go live! 🚀**
