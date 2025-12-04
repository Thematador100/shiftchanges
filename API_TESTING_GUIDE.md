# ShiftChange API Testing Guide

This guide provides step-by-step instructions to test all API endpoints to ensure the application is fully functional before going live.

---

## Prerequisites

Before testing, ensure you have:

1. **Postman** or **curl** installed for API testing
2. **Your Neon database connection** verified
3. **All environment variables set** in your Vercel deployment
4. **Stripe LIVE MODE keys** configured

---

## API Endpoints Overview

| Endpoint | Method | Auth Required | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/gemini` | POST | Depends on action | AI Resume Generation & Analysis |
| `/api/webhook` | POST | No | Stripe Payment Webhook |
| `/api/create-payment-intent` | POST | No | Create Stripe Payment Intent |
| `/api/get-auth-token` | POST | No | Retrieve Auth Token After Payment |
| `/api/auth-check` | POST | Yes | Verify Auth Token Validity |

---

## Test 1: Server Health Check (Ping)

**Endpoint:** `POST /api/gemini`

**Request:**
```json
{
  "action": "ping"
}
```

**Expected Response:**
```json
{
  "status": "ok"
}
```

**Test Result:** ✅ Server is running and responding

---

## Test 2: Free Feature - Resume Critique

**Endpoint:** `POST /api/gemini`

**Auth Required:** No

**Request:**
```json
{
  "action": "critique",
  "payload": {
    "resumeData": {
      "personalDetails": {
        "fullName": "Jane Doe",
        "jobTitle": "Registered Nurse",
        "email": "jane@example.com",
        "phone": "555-1234",
        "location": "New York, NY",
        "linkedin": "linkedin.com/in/janedoe"
      },
      "summary": "Experienced RN with 5 years in ICU",
      "experience": [
        {
          "jobTitle": "ICU Nurse",
          "company": "Hospital ABC",
          "location": "New York, NY",
          "startDate": "2019",
          "endDate": "2024",
          "responsibilities": ["Managed CRRT", "Reduced CLABSI rates by 20%"]
        }
      ],
      "education": [
        {
          "degree": "BSN",
          "institution": "University of New York",
          "location": "New York, NY",
          "graduationDate": "2019"
        }
      ],
      "skills": ["CRRT", "Ventilator Management", "Critical Care"],
      "softSkills": ["Communication", "Leadership"]
    }
  }
}
```

**Expected Response:**
```json
{
  "overallFeedback": "Strong clinical background with good metrics...",
  "strengths": ["Quantified outcomes", "Specific skills"],
  "areasForImprovement": ["Add more leadership examples"],
  "bulletPointImprovements": [...]
}
```

**Test Result:** ✅ Free feature works without authentication

---

## Test 3: Free Feature - Job Match Score

**Endpoint:** `POST /api/gemini`

**Auth Required:** No

**Request:**
```json
{
  "action": "matchScore",
  "payload": {
    "resumeData": { /* same as above */ },
    "jobDescription": "Seeking experienced ICU RN with CRRT experience and leadership skills. Must have 3+ years experience. Magnet hospital environment."
  }
}
```

**Expected Response:**
```json
{
  "score": 85,
  "probability": "High",
  "missingKeywords": ["Magnet", "Joint Commission"],
  "criticalGaps": [],
  "reasoning": "Strong match with all required skills..."
}
```

**Test Result:** ✅ Free feature works without authentication

---

## Test 4: Paid Feature - Generate Resume (Without Auth)

**Endpoint:** `POST /api/gemini`

**Auth Required:** Yes

**Request (No Auth Token):**
```json
{
  "action": "generate",
  "payload": {
    "prompt": "New Grad RN, BSN. Capstone in ER. 3.8 GPA. ACLS certified.",
    "level": "new_grad"
  }
}
```

**Expected Response:**
```json
{
  "message": "Authentication required. Please purchase a plan to use this feature."
}
```

**HTTP Status:** `401 Unauthorized`

**Test Result:** ✅ Paywall is enforced for paid features

---

## Test 5: Paid Feature - Generate Resume (With Valid Auth)

**Endpoint:** `POST /api/gemini`

**Auth Required:** Yes

**Request (With Valid Auth Token):**
```json
{
  "action": "generate",
  "payload": {
    "prompt": "New Grad RN, BSN. Capstone in ER. 3.8 GPA. ACLS certified.",
    "level": "new_grad"
  },
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response:**
```json
{
  "personalDetails": { /* structured resume data */ },
  "summary": "Generated summary...",
  "experience": [ /* structured experience */ ],
  "education": [ /* structured education */ ],
  "skills": [ /* AI-generated skills */ ],
  "softSkills": [ /* AI-generated soft skills */ ]
}
```

**HTTP Status:** `200 OK`

**Test Result:** ✅ Paid feature works with valid authentication

---

## Test 6: Create Payment Intent

**Endpoint:** `POST /api/create-payment-intent`

**Auth Required:** No

**Request:**
```json
{
  "plan": "fast-ai",
  "email": "user@example.com",
  "couponCode": null
}
```

**Expected Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefgh...",
  "amount": 14900,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

**HTTP Status:** `200 OK`

**Test Result:** ✅ Payment intent created successfully

---

## Test 7: Retrieve Auth Token After Payment

**Endpoint:** `POST /api/get-auth-token`

**Auth Required:** No

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Expected Response (User Has Access):**
```json
{
  "success": true,
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "plan": "fast-ai",
  "message": "Authentication successful."
}
```

**HTTP Status:** `200 OK`

**Expected Response (User Has No Access):**
```json
{
  "success": false,
  "message": "No active subscription found for this email."
}
```

**HTTP Status:** `403 Forbidden`

**Test Result:** ✅ Token retrieval works correctly

---

## Test 8: Verify Auth Token

**Endpoint:** `POST /api/auth-check`

**Auth Required:** Yes

**Request:**
```json
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (Valid Token):**
```json
{
  "valid": true,
  "email": "user@example.com",
  "plan": "fast-ai"
}
```

**HTTP Status:** `200 OK`

**Expected Response (Invalid Token):**
```json
{
  "valid": false,
  "message": "Invalid or expired token."
}
```

**HTTP Status:** `401 Unauthorized`

**Test Result:** ✅ Token verification works correctly

---

## Test 9: Stripe Webhook Simulation

**Endpoint:** `POST /api/webhook`

**Auth Required:** No (Stripe signs the request)

**Request (Simulated Stripe Event):**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "metadata": {
        "email": "user@example.com",
        "plan": "fast-ai"
      }
    }
  }
}
```

**Expected Response:**
```json
{
  "received": true,
  "message": "User access granted for user@example.com"
}
```

**HTTP Status:** `200 OK`

**Test Result:** ✅ Webhook processes payment events correctly

---

## Complete User Flow Test

### Step 1: User Visits App (Free Features)
- ✅ Critique resume (no auth required)
- ✅ Match resume to job (no auth required)

### Step 2: User Attempts Paid Feature
- ✅ Redirected to checkout
- ✅ Payment intent created

### Step 3: User Completes Payment
- ✅ Stripe webhook triggered
- ✅ User record created in database
- ✅ Auth token generated

### Step 4: User Returns to App
- ✅ Auth token retrieved from database
- ✅ User automatically logged in
- ✅ Can now use all paid features

### Step 5: User Uses Paid Features
- ✅ Generate resume
- ✅ Improve resume
- ✅ Tailor resume
- ✅ Generate cover letter
- ✅ Optimize skills

---

## Troubleshooting

### Issue: "Authentication required" on free features
**Solution:** Free features (critique, matchScore) should NOT require auth tokens. Check that `paidActions` array in `/api/gemini.js` does not include these actions.

### Issue: "Invalid or expired token" after payment
**Solution:** Verify that `JWT_SECRET` is set in Vercel and matches the secret used to sign tokens.

### Issue: Webhook not triggering
**Solution:** 
1. Check Stripe Dashboard > Developers > Webhooks for delivery logs
2. Verify webhook URL is publicly accessible
3. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly in Vercel

### Issue: Payment succeeds but user not logged in
**Solution:**
1. Check database: Is user record in `user_access` table?
2. Check browser console for errors in `/api/get-auth-token` call
3. Verify `DATABASE_URL` is set in Vercel

---

## Performance Benchmarks

| Action | Expected Time | Acceptable Range |
| :--- | :--- | :--- |
| Ping | < 100ms | < 500ms |
| Critique | 2-5s | < 10s |
| Match Score | 2-5s | < 10s |
| Generate Resume | 5-15s | < 30s |
| Improve Resume | 5-15s | < 30s |
| Tailor Resume | 5-15s | < 30s |
| Cover Letter | 5-15s | < 30s |
| Optimize Skills | 3-8s | < 15s |

---

## Security Checklist

- [ ] All API keys are set in Vercel (not hardcoded)
- [ ] `JWT_SECRET` is a strong, random string
- [ ] Stripe is in LIVE MODE (not test mode)
- [ ] Webhook URL is HTTPS (not HTTP)
- [ ] Database connection uses SSL
- [ ] Auth tokens are validated on every paid request
- [ ] Database access is checked after token verification

---

## Deployment Verification

After deploying to Vercel, run these tests in order:

1. ✅ Test 1: Ping
2. ✅ Test 2: Critique (free)
3. ✅ Test 3: Match Score (free)
4. ✅ Test 4: Generate without auth (should fail)
5. ✅ Test 5: Create payment intent
6. ✅ Test 6: Complete test payment with Stripe test card
7. ✅ Test 7: Retrieve auth token
8. ✅ Test 8: Verify auth token
9. ✅ Test 9: Generate with auth (should succeed)

Once all tests pass, your application is **ready for production**. 🚀
