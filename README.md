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

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_live_...) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `API_KEY` | Google Gemini API key |
| `VITE_ADMIN_PASSWORD` | (Optional) Admin password |

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

# Create .env.local with your keys
cp .env.example .env.local

# Start dev server
npm run dev
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Stripe Payments
- Vercel Serverless Functions
