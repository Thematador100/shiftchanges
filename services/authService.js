import jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || '').trim();

if (!JWT_SECRET) {
  console.warn("JWT_SECRET environment variable is not set. Authentication will not work in production.");
}

/**
 * Generates a JWT token for a user after successful payment.
 * This token is returned to the frontend and stored in local storage.
 * @param {string} email - The user's email address.
 * @param {string} plan - The purchased plan name.
 * @returns {string} - The signed JWT token.
 */
export function generateAuthToken(email, plan) {
  const payload = {
    email,
    plan,
    iat: Math.floor(Date.now() / 1000), // Issued at
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '365d' });
  return token;
}

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 * @param {string} token - The JWT token to verify.
 * @returns {{email: string, plan: string} | null} - The decoded payload or null if invalid.
 */
export function verifyAuthToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      email: decoded.email,
      plan: decoded.plan,
    };
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export default {
  generateAuthToken,
  verifyAuthToken,
};
