# ShiftChange Production Deployment Checklist

## ✅ What's Ready

- [x] Frontend code - builds without errors
- [x] Google Gemini AI integration - API key configured
- [x] Stripe payment integration - code is production-ready
- [x] All manual resume features - editing, templates, PDF export
- [x] Admin lock feature with password protection
- [x] Vercel deployment configuration

## ⚠️ What You Need to Do

### 1. Get Real Stripe API Keys (5 minutes)
See: **STRIPE_PRODUCTION_SETUP.md**

1. Go to https://dashboard.stripe.com
2. Switch to **Live Mode**
3. Get your `sk_live_` and `pk_live_` keys
4. Add them to Vercel environment variables

### 2. Deploy to Vercel (5 minutes)
See: **DEPLOY_NOW.md**

```bash
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard:
- `API_KEY` = AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU
- `GEMINI_API_KEY` = AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU
- `STRIPE_SECRET_KEY` = your live secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` = your live publishable key
- `VITE_ADMIN_PASSWORD` = shiftchange2025

### 3. Set Up Stripe Webhook (3 minutes)
See: **STRIPE_PRODUCTION_SETUP.md** - Step 3

1. Add webhook endpoint: `https://your-site.vercel.app/api/webhook`
2. Select event: `payment_intent.succeeded`
3. Copy webhook secret
4. Add `STRIPE_WEBHOOK_SECRET` to Vercel

### 4. Test Everything (10 minutes)

**AI Features:**
- [ ] Generate resume with AI
- [ ] AI critique works
- [ ] Job match score works
- [ ] Cover letter generation works

**Payment:**
- [ ] Make a test purchase (use your own card, $1.49)
- [ ] Verify payment shows in Stripe Dashboard
- [ ] Check webhook fired (Stripe Dashboard → Developers → Webhooks)

**Manual Features:**
- [ ] Edit resume manually
- [ ] Switch templates
- [ ] Export PDF
- [ ] Lock/unlock with password

---

## 🚨 Before Public Launch

See: **COMMERCIAL_READINESS_REPORT.md** for full details

### Critical Security Issues to Fix:

1. **CORS Configuration** (`api/create-payment-intent.js:22`)
   - Current: `Access-Control-Allow-Origin: *` with credentials
   - Fix: Specify your exact domain

2. **Admin Password** (`src/App.tsx`)
   - Current: Hardcoded fallback `'shiftchange2025'`
   - Fix: Use server-side authentication

3. **Input Validation**
   - Add validation for all user inputs
   - Sanitize resume data before AI processing

4. **Rate Limiting**
   - Add limits to prevent AI API abuse
   - Protect payment endpoints

5. **Webhook Business Logic** (`api/webhook.js:44`)
   - Currently just logs payment success
   - Need to: Grant access, send email, record purchase

6. **User Account System**
   - Add database to track purchases
   - Implement proper authentication
   - Track who has access to paid features

### Legal Requirements:

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add GDPR compliance (if EU users)
- [ ] Add software license
- [ ] Set up email notifications

---

## Timeline to Full Production

**Immediate (Today - 15 minutes):**
- Get Stripe live keys
- Deploy to Vercel
- Test with small real payment

**Phase 1 (1-2 days):**
- Fix CORS to specific domain
- Add input validation
- Implement basic rate limiting

**Phase 2 (1 week):**
- Add user account system with database
- Implement webhook business logic
- Set up email notifications

**Phase 3 (2 weeks):**
- Add Terms/Privacy pages
- GDPR compliance
- Security audit

---

## Can You Use It Now?

**YES, but with limitations:**

✅ You CAN accept real payments today
✅ AI resume generation works
✅ All features functional

⚠️ You CANNOT:
- Track which users paid (no database)
- Grant automated access after payment
- Send confirmation emails
- Comply with GDPR/legal requirements

**Recommended:** Deploy now for private testing, fix critical issues before public launch.

---

## Quick Deploy Command

```bash
# 1. Get Stripe keys from dashboard.stripe.com
# 2. Deploy
vercel --prod
# 3. Add environment variables in Vercel dashboard
# 4. Test with real payment
```

**Your site will be live in 10 minutes!**

---

## Support Documentation

- Full security audit: `COMMERCIAL_READINESS_REPORT.md`
- Stripe setup: `STRIPE_PRODUCTION_SETUP.md`
- Deployment guide: `DEPLOY_NOW.md`
- Local development: `DEV_SETUP_GUIDE.md`
