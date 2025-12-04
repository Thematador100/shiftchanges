import { getAllCustomers, searchCustomers, updateUserAccess } from '../services/dbService.js';
import { generateAuthToken } from '../services/authService.js';
import { sendLoginEmail } from '../services/emailService.js';

const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'shiftchange2025';

// Simple admin authentication
function isAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check admin authentication
  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }

  try {
    // GET - List all customers or search
    if (req.method === 'GET') {
      const { search, limit, offset } = req.query;
      
      let customers;
      if (search) {
        customers = await searchCustomers(search);
      } else {
        customers = await getAllCustomers(
          parseInt(limit) || 100,
          parseInt(offset) || 0
        );
      }
      
      return res.status(200).json({ customers });
    }

    // POST - Admin actions (grant/revoke access, send login email)
    if (req.method === 'POST') {
      const { action, email, planTier } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      switch (action) {
        case 'grant_access':
          if (!planTier) {
            return res.status(400).json({ error: 'Plan tier is required' });
          }
          await updateUserAccess(email, true);
          return res.status(200).json({ 
            success: true, 
            message: `Access granted for ${email}` 
          });

        case 'revoke_access':
          await updateUserAccess(email, false);
          return res.status(200).json({ 
            success: true, 
            message: `Access revoked for ${email}` 
          });

        case 'send_login_email':
          if (!planTier) {
            return res.status(400).json({ error: 'Plan tier is required' });
          }
          const authToken = generateAuthToken(email, planTier);
          await sendLoginEmail(email, authToken);
          return res.status(200).json({ 
            success: true, 
            message: `Login email sent to ${email}` 
          });

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ 
      error: 'An error occurred processing your request' 
    });
  }
}
