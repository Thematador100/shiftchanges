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
      plan_tier TEXT NOT NULL,
      access_granted BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
 * @returns {Promise<void>}
 */
export async function grantUserAccess(email, plan) {
  const upsertQuery = `
    INSERT INTO user_access (email, plan_tier, access_granted)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (email) DO UPDATE
    SET plan_tier = $2, access_granted = TRUE;
  `;
  await query(upsertQuery, [email, plan]);
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

// Call setup on service load (for serverless cold start)
// Note: In a real deployment, this is often done via migrations, but for a simple app, this is sufficient.
// setupDatabase();

export default {
  query,
  setupDatabase,
  grantUserAccess,
  checkUserAccess,
};
