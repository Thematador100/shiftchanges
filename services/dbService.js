import { Pool } from 'pg';

// The connection string is read from the environment variable.
// In a Vercel environment, this will be securely available to the serverless functions.
let pool;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set.");
    // In a serverless environment, we can't throw here on import, 
    // but we must throw when a database operation is attempted.
    return null; 
  }

  // Create a connection pool for efficient database access
  pool = new Pool({
    connectionString,
    // Neon requires SSL for connection
    ssl: {
      rejectUnauthorized: false,
    },
  });
  return pool;
}

/**
 * Executes a generic SQL query.
 * @param {string} text - The SQL query text.
 * @param {Array<any>} params - The parameters for the query.
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error("Database connection failed: DATABASE_URL is missing. Please set the environment variable.");
  }
  
  const client = await currentPool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error('Database Query Error:', err.stack);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Creates the user_access table if it does not exist.
 * This is a one-time setup step.
 */
export async function setupDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_access (
      email TEXT PRIMARY KEY,
      customer_name TEXT,
      plan_tier TEXT NOT NULL,
      payment_amount INTEGER,
      payment_intent_id TEXT,
      access_granted BOOLEAN NOT NULL DEFAULT TRUE,
      resume_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE,
      last_resume_update TIMESTAMP WITH TIME ZONE
    );
  `;
  try {
    await query(createTableQuery);
    console.log("Database setup complete: user_access table ensured.");
  } catch (error) {
    console.error("Failed to set up database table:", error);
    throw error;
  }
}

/**
 * Grants user access to a specific plan after a successful payment.
 * @param {string} email - The user's email address.
 * @param {string} plan - The purchased plan name.
 * @param {Object} details - Additional customer details (optional)
 * @returns {Promise<void>}
 */
export async function grantUserAccess(email, plan, details = {}) {
  const { customerName, paymentAmount, paymentIntentId } = details;
  
  const upsertQuery = `
    INSERT INTO user_access (email, customer_name, plan_tier, payment_amount, payment_intent_id, access_granted)
    VALUES ($1, $2, $3, $4, $5, TRUE)
    ON CONFLICT (email) DO UPDATE
    SET plan_tier = $3, 
        payment_amount = COALESCE($4, user_access.payment_amount),
        payment_intent_id = COALESCE($5, user_access.payment_intent_id),
        customer_name = COALESCE($2, user_access.customer_name),
        access_granted = TRUE;
  `;
  await query(upsertQuery, [email, customerName || null, plan, paymentAmount || null, paymentIntentId || null]);
  console.log(`Access granted/updated for ${email} to plan: ${plan}`);
}

/**
 * Checks a user's access status.
 * @param {string} email - The user's email address.
 * @returns {Promise<{plan_tier: string, access_granted: boolean} | null>}
 */
export async function checkUserAccess(email) {
  const selectQuery = `
    SELECT plan_tier, access_granted
    FROM user_access
    WHERE email = $1;
  `;
  const res = await query(selectQuery, [email]);
  return res.rows[0] || null;
}

/**
 * Gets all customers for admin dashboard
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<Array>}
 */
export async function getAllCustomers(limit = 100, offset = 0) {
  const selectQuery = `
    SELECT email, customer_name, plan_tier, payment_amount, payment_intent_id, 
           access_granted, created_at, last_login
    FROM user_access
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2;
  `;
  const res = await query(selectQuery, [limit, offset]);
  return res.rows;
}

/**
 * Searches customers by email or name
 * @param {string} searchTerm - Search term for email or name
 * @returns {Promise<Array>}
 */
export async function searchCustomers(searchTerm) {
  const selectQuery = `
    SELECT email, customer_name, plan_tier, payment_amount, payment_intent_id,
           access_granted, created_at, last_login
    FROM user_access
    WHERE email ILIKE $1 OR customer_name ILIKE $1
    ORDER BY created_at DESC;
  `;
  const res = await query(selectQuery, [`%${searchTerm}%`]);
  return res.rows;
}

/**
 * Revokes or restores user access
 * @param {string} email - The user's email address
 * @param {boolean} accessGranted - Whether to grant or revoke access
 * @returns {Promise<void>}
 */
export async function updateUserAccess(email, accessGranted) {
  const updateQuery = `
    UPDATE user_access
    SET access_granted = $2
    WHERE email = $1;
  `;
  await query(updateQuery, [email, accessGranted]);
  console.log(`Access ${accessGranted ? 'granted' : 'revoked'} for ${email}`);
}

/**
 * Updates last login timestamp
 * @param {string} email - The user's email address
 * @returns {Promise<void>}
 */
export async function updateLastLogin(email) {
  const updateQuery = `
    UPDATE user_access
    SET last_login = NOW()
    WHERE email = $1;
  `;
  await query(updateQuery, [email]);
}

/**
 * Saves resume data for a user
 * @param {string} email - The user's email address
 * @param {Object} resumeData - The resume data object
 * @returns {Promise<void>}
 */
export async function saveResumeData(email, resumeData) {
  const updateQuery = `
    UPDATE user_access
    SET resume_data = $2, last_resume_update = NOW()
    WHERE email = $1;
  `;
  await query(updateQuery, [email, JSON.stringify(resumeData)]);
  console.log(`Resume data saved for ${email}`);
}

/**
 * Retrieves resume data for a user
 * @param {string} email - The user's email address
 * @returns {Promise<Object|null>} The resume data or null if not found
 */
export async function getResumeData(email) {
  const selectQuery = `
    SELECT resume_data
    FROM user_access
    WHERE email = $1;
  `;
  const res = await query(selectQuery, [email]);
  if (res.rows.length === 0) return null;
  return res.rows[0].resume_data;
}

// Call setup on service load (for serverless cold start)
// Note: In a real deployment, this is often done via migrations, but for a simple app, this is sufficient.
// setupDatabase();

export default {
  query,
  setupDatabase,
  grantUserAccess,
  checkUserAccess,
  getAllCustomers,
  searchCustomers,
  updateUserAccess,
  updateLastLogin,
  saveResumeData,
  getResumeData,
};
