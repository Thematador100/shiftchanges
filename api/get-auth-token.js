import { checkUserAccess } from '../services/dbService.js';
import { generateAuthToken } from '../services/authService.js';

export default async function handler(req, res) {
  // CORS headers
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required.' 
      });
    }

    // Check if the user has access in the database
    const accessRecord = await checkUserAccess(email);

    if (!accessRecord || !accessRecord.access_granted) {
      return res.status(403).json({ 
        success: false,
        message: 'No active subscription found for this email.' 
      });
    }

    // Generate a fresh auth token for the user
    const authToken = generateAuthToken(email, accessRecord.plan_tier);

    return res.json({
      success: true,
      authToken,
      email,
      plan: accessRecord.plan_tier,
      message: 'Authentication successful.'
    });

  } catch (error) {
    console.error('Get Auth Token Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while retrieving your authentication token.' 
    });
  }
}
