# Development Setup Guide - ShiftChange

## Current Status
✅ Dependencies installed
✅ Build completes successfully
✅ Dev server runs on http://localhost:5173
⚠️  **API Keys Required** - Need to add real keys to test AI features

---

## Quick Start (Local Development)

### 1. Add Your API Keys

Edit `.env.local` with your actual API keys:

```bash
# Google Gemini AI API Key (REQUIRED for resume generation)
# Get your key from: https://makersuite.google.com/app/apikey
API_KEY=AIzaSy...your_actual_key_here
GEMINI_API_KEY=AIzaSy...your_actual_key_here

# Stripe Payment Keys (Test Mode) - Optional for testing payments
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...your_test_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...your_test_key

# Stripe Webhook Secret - Optional for payment webhooks
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret

# Admin Password - Already set, no changes needed
VITE_ADMIN_PASSWORD=shiftchange2025
```

### 2. Start Development Server

**Option A: Frontend Only (No API routes)**
```bash
npm run dev
# Opens on http://localhost:5173
# ⚠️ AI features won't work - API routes not available
```

**Option B: Full Stack with Vercel CLI (Recommended)**
```bash
vercel dev
# Opens on http://localhost:3000
# ✅ All features work including API routes
# Note: First time will ask you to link to Vercel project (can skip)
```

### 3. Test the Application

Once running with `vercel dev`:

1. **Open browser**: http://localhost:3000
2. **Click "Generate with AI"** on welcome screen
3. **Enter a test prompt**: "Create a resume for an ICU nurse with 5 years experience"
4. **Should see**: Resume generated with AI if API key is valid

---

## What Works vs What Needs API Keys

### ✅ Works Without API Keys:
- Frontend UI loads
- Manual resume editing
- Template switching
- PDF export (basic)
- Password lock feature

### ⚠️ Requires Gemini API Key:
- AI resume generation from prompt
- Resume improvement from uploaded text
- AI critique and feedback
- Job description matching
- Skills optimization
- Cover letter generation

### ⚠️ Requires Stripe Keys:
- Payment processing
- Package tier unlocking
- Webhook handling

---

## Getting Your API Keys

### Google Gemini API (Required)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Paste into `.env.local` as `API_KEY`

**Note:** Free tier includes generous quota. Check pricing at:
https://ai.google.dev/pricing

### Stripe Test Keys (Optional - for payment testing)

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Sign up for Stripe account (free)
3. Copy "Publishable key" (starts with `pk_test_...`)
4. Copy "Secret key" (starts with `sk_test_...`)
5. Paste both into `.env.local`

**Note:** Test mode is completely free, no real charges

---

## Testing Checklist

Once you have Gemini API key configured:

- [ ] Run `vercel dev`
- [ ] Open http://localhost:3000
- [ ] Test: Click "Generate with AI"
- [ ] Test: Enter prompt and select career level
- [ ] Verify: Resume generates successfully
- [ ] Test: Click "AI Critique" tab
- [ ] Test: Click "Job Match" tab
- [ ] Test: Skills optimization button
- [ ] Check: No console errors

---

## Common Issues

### Issue: "Server configuration error: API key missing"
**Fix:** Make sure `API_KEY` in `.env.local` has your real Gemini key

### Issue: "Could not connect to the Intelligence Engine"
**Fix:**
1. Check API key is valid at https://makersuite.google.com
2. Verify `.env.local` file exists in project root
3. Restart `vercel dev` after adding keys

### Issue: API routes return 404
**Fix:** Use `vercel dev` instead of `npm run dev`

### Issue: Stripe payment doesn't work
**Fix:** This is expected without Stripe keys. You can use coupon code `DEMO_MODE` to bypass payment

---

## Environment Files

- `.env.local` - Your local development keys (git ignored, keep private)
- `.env.example` - Template file (safe to commit)
- Environment variables on Vercel - Production keys (set in Vercel dashboard)

**Never commit `.env.local` to git!** (It's already in `.gitignore`)

---

## Next Steps After Testing

1. **If everything works**: Ready for Vercel deployment
2. **Before deploying**: Review `COMMERCIAL_READINESS_REPORT.md` for security fixes
3. **Production keys**: Add real keys in Vercel dashboard (not test keys)

---

## Quick Test Command

Test if API endpoint works:
```bash
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"action":"ping","payload":{}}'

# Expected response: {"status":"ok"}
```

---

## Support

- Gemini API Docs: https://ai.google.dev/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs
- React + Vite: https://vitejs.dev/guide

---

**Ready to test?** Add your Gemini API key to `.env.local` and run `vercel dev`!
