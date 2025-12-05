import { checkUserAccess } from '../services/dbService.js';
import { generateAuthToken, verifyAuthToken } from '../services/authService.js';
import { sendLoginEmail } from '../services/emailService.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, action } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userEmail = email.trim().toLowerCase();

    // Check if user exists in database
    const userAccess = await checkUserAccess(userEmail);

    if (!userAccess) {
      return res.status(404).json({ 
        error: 'No account found with this email. Please complete a purchase first.' 
      });
    }

    if (!userAccess.access_granted) {
      return res.status(403).json({ 
        error: 'Account access has been revoked. Please contact support.' 
      });
    }

    // Generate new auth token
    const authToken = generateAuthToken(userEmail, userAccess.plan_tier);

    // If action is 'send_email', send the token via email
    if (action === 'send_email') {
      await sendLoginEmail(userEmail, authToken);
      return res.status(200).json({ 
        success: true,
        message: 'Login token has been sent to your email.' 
      });
    }

    // Otherwise, return the token directly
    return res.status(200).json({ 
      success: true,
      authToken,
      planTier: userAccess.plan_tier,
      email: userEmail,
      message: 'Login successful' 
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      error: 'An error occurred during login. Please try again.' 
    });
  }
}
