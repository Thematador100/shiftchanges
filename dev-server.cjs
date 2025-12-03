// Local Development Server with API Routes
// This allows testing the full app without Vercel CLI authentication
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes - Import the Vercel serverless functions
app.post('/api/gemini', async (req, res) => {
  try {
    const handler = require('./api/gemini.js').default;
    await handler(req, res);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const handler = require('./api/create-payment-intent.js').default;
    await handler(req, res);
  } catch (error) {
    console.error('Payment API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook', async (req, res) => {
  try {
    const handler = require('./api/webhook.js').default;
    await handler(req, res);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy all other requests to Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Proxy websockets for HMR
}));

app.listen(PORT, () => {
  console.log(`\n✅ Local dev server running!`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API Routes: http://localhost:${PORT}/api/*`);
  console.log(`\n   Environment Variables Loaded:`);
  console.log(`   - API_KEY: ${process.env.API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`\n   Press Ctrl+C to stop\n`);
});
