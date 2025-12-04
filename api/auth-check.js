import { verifyAuthToken } from '../services/authService.js';
import { checkUserAccess } from '../services/dbService.js';

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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        hasAccess: false, 
        message: 'No authentication token provided.' 
      });
    }

    // Verify the JWT token
    const decoded = verifyAuthToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        hasAccess: false, 
        message: 'Invalid or expired authentication token.' 
      });
    }

    // Double-check in the database to ensure the user still has access
    const dbRecord = await checkUserAccess(decoded.email);

    if (!dbRecord || !dbRecord.access_granted) {
      return res.status(403).json({ 
        hasAccess: false, 
        message: 'Access has been revoked or user not found in database.' 
      });
    }

    // All checks passed
    return res.json({
      hasAccess: true,
      email: decoded.email,
      plan: decoded.plan,
      message: 'Access granted.'
    });

  } catch (error) {
    console.error('Auth Check Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
