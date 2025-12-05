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
