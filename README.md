# ShiftChange - Clinical Career Velocity

AI-powered resume builder for nurses and healthcare professionals.

## Features

- AI Resume Generation (powered by Google Gemini)
- ATS Optimization
- Job Description Matching
- Cover Letter Generation
- Stripe Payment Integration

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/shiftchange.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite framework

### 3. Configure Environment Variables

In your Vercel project settings (Settings > Environment Variables), add:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/app/apikey)) | **Yes** |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_live_...) | **Yes** |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (pk_live_...) | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | **Yes** |
| `VITE_ADMIN_PASSWORD` | Admin password for God Mode (default: shiftchange2025) | No |

**Important:** After adding environment variables, you MUST redeploy your application for changes to take effect.

### 4. Set Up Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhook`
3. Select events: `payment_intent.succeeded`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Deploy

Vercel will automatically deploy on every push to main.

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your keys
cp .env.example .env
# Edit .env and add your actual API keys

# Start dev server
npm run dev
```

**Note:** For local development, create a `.env` file (not `.env.local`) in the root directory. Vercel's serverless functions look for `.env` during local development.

## Troubleshooting

### "Connection Error" or "Server configuration error: API key missing"

If you see these errors after deploying to Vercel:

1. **Verify environment variable name:** Make sure you're using `GEMINI_API_KEY` (not `API_KEY`) in Vercel settings
2. **Check all environments:** Ensure the variable is set for Production, Preview, AND Development
3. **Redeploy:** After adding/changing environment variables, you MUST trigger a new deployment:
   - Go to Deployments tab in Vercel
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger automatic deployment
4. **Verify API key:** Test your Gemini API key at [Google AI Studio](https://aistudio.google.com/)

### "API_KEY already exists" Error

If Vercel says the variable already exists:
- Delete the old `API_KEY` variable
- Add a new variable named `GEMINI_API_KEY` instead
- This is more specific and won't conflict with other services

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Stripe Payments
- Vercel Serverless Functions
