# Stage 1 Deployment - Basic Site Testing

## Quick Deploy Guide

### Step 1: Deploy to Vercel

```bash
vercel --prod
```

This will:
- Deploy your site to production
- Give you a live URL (e.g., `https://shiftchanges-xyz.vercel.app`)

---

### Step 2: Add Environment Variables

**Go to Vercel Dashboard:**
1. Visit https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add these **4 variables** (for all environments: Production, Preview, Development):

```
API_KEY
Value: AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU

GEMINI_API_KEY
Value: AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU

DEEPSEEK_API_KEY
Value: sk-c7cb7706be1d4185ad81ef4e4df7ecf7

VITE_ADMIN_PASSWORD
Value: shiftchange2025
```

**How the AI Backup System Works:**
- **Primary**: Google Gemini (tries first)
- **Backup**: DeepSeek (automatic fallback if Gemini fails)
- If Gemini fails, the system automatically switches to DeepSeek without user intervention

5. Click **Save**
6. **Redeploy** your site: `vercel --prod` (environment variables require redeploy)

---

### Step 3: Test Everything

Once deployed, visit your live URL and test:

## ✅ Stage 1 Testing Checklist

### Basic UI
- [ ] Site loads without errors
- [ ] Welcome screen appears with package tiers
- [ ] "Get Started" button works
- [ ] UI is responsive on mobile

### Manual Resume Features
- [ ] Add personal details (name, email, phone, location)
- [ ] Add work experience entry
- [ ] Add responsibilities to work experience
- [ ] Add education entry
- [ ] Add/remove skills
- [ ] Add/remove certifications
- [ ] Add/remove awards
- [ ] Delete entries works (X button)
- [ ] Drag to reorder items works

### Template System
- [ ] Switch to "Professional" template
- [ ] Switch to "Modern" template
- [ ] Switch to "Compact" template
- [ ] Layout changes reflect immediately

### PDF Export
- [ ] Click "Export PDF" button
- [ ] PDF downloads successfully
- [ ] PDF shows all resume data
- [ ] PDF formatting looks professional

### AI Features (CRITICAL)
- [ ] **Generate Resume**: Fill in prompt → Click "Generate" → Resume populates
- [ ] **AI Critique**: Click Critique tab → Get feedback
- [ ] **Job Match Score**: Click Tailor tab → Paste job description → Get match score
- [ ] **Tailor Resume**: Click "Tailor to Job" → Resume updates
- [ ] **Cover Letter**: Click Cover Letter tab → Generate letter
- [ ] **Optimize Skills**: Click "Optimize Skills" → New skills suggested

### Admin/God Mode
- [ ] Click logo in header 5 times quickly
- [ ] Prompt appears asking for password
- [ ] Enter: `shiftchange2025`
- [ ] Notification: "God Mode Activated"
- [ ] All features unlock (even without payment)

### Data Persistence
- [ ] Make changes to resume
- [ ] Refresh page
- [ ] Data persists (stored in localStorage)
- [ ] Close tab, reopen → Data still there

### Lock Feature
- [ ] Click "Lock" button in header
- [ ] Set password
- [ ] Refresh page → Lock screen appears
- [ ] Enter correct password → Access granted

---

## Expected Errors (Normal for Stage 1)

**Payment Features:**
- Clicking package tier checkout buttons → Will error (no Stripe keys yet)
- This is EXPECTED and will be fixed in Stage 2

**Webhook Endpoint:**
- `/api/webhook` may log errors about missing `STRIPE_WEBHOOK_SECRET`
- This is EXPECTED and harmless for Stage 1

---

## If AI Features Don't Work

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - `Server configuration error: API key missing`
   - `fetch failed`
   - `CORS error`

### Common Issues:

**Issue: "Server configuration error"**
- **Cause:** Environment variables not set
- **Fix:** Verify `API_KEY` and `GEMINI_API_KEY` in Vercel dashboard, then redeploy

**Issue: "Network error" or "fetch failed"**
- **Cause:** API endpoint not found
- **Fix:** Check that `/api/gemini.js` deployed correctly (check Vercel Functions tab)

**Issue: CORS error**
- **Cause:** Frontend trying to call API from different domain
- **Fix:** This should NOT happen with Vercel (same domain). If it does, let me know.

**Issue: Rate limit error (429)**
- **Cause:** Made more than 20 AI requests in 1 minute
- **Fix:** Wait 1 minute and try again (this is working as intended)

---

## Success Criteria for Stage 1

You should be able to:
1. ✅ Generate a complete resume using AI
2. ✅ Edit resume manually
3. ✅ Export to PDF
4. ✅ Use all AI features (critique, match, tailor, cover letter, optimize)
5. ✅ Lock/unlock with password
6. ✅ Access admin mode with password

If all of these work → **Stage 1 PASSED** → Ready for Stage 2 (Payments)

---

## Deployment Commands Summary

```bash
# Initial deploy
vercel --prod

# After adding environment variables in dashboard
vercel --prod

# View logs if something breaks
vercel logs

# Check deployment status
vercel list
```

---

## Quick Reference

**Your Environment Variables (Stage 1 Only):**
```
API_KEY=AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU
GEMINI_API_KEY=AIzaSyAkir5Yb08HTaWo5U0FdG9T18ML0vUC_GU
DEEPSEEK_API_KEY=sk-c7cb7706be1d4185ad81ef4e4df7ecf7
VITE_ADMIN_PASSWORD=shiftchange2025
```

**AI Provider Failover:**
- Gemini → DeepSeek (automatic)

**What's NOT deployed yet:**
- Stripe payment processing (Stage 2)
- Webhook functionality (Stage 3)
- Database/user accounts (Future)

---

## Next Steps After Stage 1 Passes

1. Report back which tests passed/failed
2. Fix any issues found
3. Move to Stage 2: Add Stripe payment testing
4. Move to Stage 3: Add webhook + database

Ready to deploy! Let me know when you need help with Stage 2.
