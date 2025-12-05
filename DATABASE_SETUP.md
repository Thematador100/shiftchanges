# Neon PostgreSQL Database Setup Guide

This guide explains how to set up and verify your Neon PostgreSQL database for the ShiftChanges application.

## Overview

The application uses Neon PostgreSQL to store:
- Customer/user access records
- Plan tiers and payment information
- Resume data (stored as JSONB)
- Login and activity timestamps

## Database Schema

The application uses a single table `user_access` with the following structure:

```sql
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
```

### Field Descriptions

- **email**: User's email address (Primary Key)
- **customer_name**: Customer's full name
- **plan_tier**: One of: `fast-ai`, `ai-target`, `expert-clinical`, or `leadership-np`
- **payment_amount**: Payment amount in cents (e.g., 14900 for $149.00)
- **payment_intent_id**: Stripe payment intent ID
- **access_granted**: Boolean flag to enable/disable user access
- **resume_data**: Full resume data stored as JSON
- **created_at**: Account creation timestamp
- **last_login**: Last login timestamp
- **last_resume_update**: Last time resume was updated

## Setup Instructions

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy your database connection string

### 2. Configure Environment Variables

Add the following to your `.env` file or Vercel environment variables:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**Important**: The connection string must include `?sslmode=require` for Neon.

### 3. Initialize the Database

The database table is automatically created when the application first runs. The `setupDatabase()` function in `services/dbService.js` handles this.

To manually initialize, you can run the SQL from `setup_db.sql` or use the extended schema in `dbService.js`.

### 4. Verify Setup

Use the Admin Dashboard to verify your database connection:

1. In the application, press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
2. Enter your admin password (default: `shiftchange2025`)
3. You should see the customer list (empty if no customers yet)

## Admin Dashboard Features

The Admin Dashboard provides:

- **Customer Overview**: Total customers, active users, revenue stats
- **Search**: Search customers by email or name
- **Customer Details**: View all customer information including:
  - Email and name
  - Plan tier with color-coded badges
  - Payment amount
  - Access status (Active/Revoked)
  - Creation and last login dates

### Accessing the Admin Dashboard

**Keyboard Shortcut**: `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)

**Admin Password**: Set via `VITE_ADMIN_PASSWORD` environment variable (default: `shiftchange2025`)

## Database Operations

The application provides the following database operations in `services/dbService.js`:

### User Management

- `grantUserAccess(email, plan, details)` - Create or update user access
- `checkUserAccess(email)` - Verify user's plan and access status
- `updateUserAccess(email, accessGranted)` - Enable/disable user access
- `updateLastLogin(email)` - Update last login timestamp

### Customer Management

- `getAllCustomers(limit, offset)` - Get paginated customer list
- `searchCustomers(searchTerm)` - Search by email or name

### Resume Data

- `saveResumeData(email, resumeData)` - Store user's resume as JSONB
- `getResumeData(email)` - Retrieve user's resume

## Pricing Tiers

The application supports the following pricing tiers:

| Tier | Internal Name | Display Name | Price |
|------|---------------|--------------|-------|
| 1 | `fast-ai` | Fast Track / New Grad | $149 |
| 2 | `ai-target` | Targeted / Bedside/Clinical | $299 |
| 3 | `expert-clinical` | Specialist / Leadership/NP | $499 |
| Dev | `leadership-np` | Executive (Dev Mode Only) | $649 |

**Note**: The `leadership-np` tier is only accessible via "God Mode" and is not purchasable through the checkout flow.

## Security Best Practices

1. **Never commit database credentials** to version control
2. Use strong admin passwords in production
3. Enable Neon's built-in security features:
   - IP allowlisting (optional)
   - Connection pooling
   - SSL enforcement
4. Regularly backup your database (Neon provides automatic backups)
5. Monitor database usage and performance

## Troubleshooting

### Connection Issues

If you see "DATABASE_URL is missing" errors:

1. Verify the `DATABASE_URL` environment variable is set
2. Ensure the connection string includes `?sslmode=require`
3. Check that your Neon database is active (not suspended)

### SSL Certificate Errors

If you encounter SSL certificate errors, ensure your connection configuration includes:

```javascript
ssl: {
  rejectUnauthorized: false,
}
```

This is already configured in `services/dbService.js`.

### Table Not Created

If the `user_access` table doesn't exist:

1. Check the application logs for errors
2. Manually run the SQL from `setup_db.sql` in Neon's SQL editor
3. Verify your database user has CREATE TABLE permissions

## Database Maintenance

### Backup

Neon provides automatic daily backups. To create a manual backup:

1. Go to your Neon project dashboard
2. Navigate to "Backups"
3. Click "Create backup"

### Monitoring

Monitor your database usage:

- **Storage**: Check JSONB resume data size
- **Connections**: Monitor active connections
- **Query Performance**: Use Neon's query insights

### Scaling

Neon automatically scales with your usage. For high-traffic scenarios:

1. Enable connection pooling
2. Consider read replicas for analytics queries
3. Use prepared statements for frequently-run queries

## API Endpoints Using Database

- `POST /api/webhook` - Stripe webhook handler (creates/updates user records)
- `POST /api/get-auth-token` - Generates auth tokens (reads user records)
- `GET /api/admin` - Admin dashboard data (requires admin auth)
- `POST /api/save-resume` - Saves resume data
- `GET /api/load-resume` - Loads resume data

## Development vs Production

### Development

- Use Neon's free tier for development
- Can use test data without concern
- Admin dashboard accessible via keyboard shortcut

### Production

1. Upgrade to Neon Pro for better performance
2. Change default admin password via `VITE_ADMIN_PASSWORD`
3. Enable IP allowlisting if possible
4. Set up monitoring and alerts
5. Configure automatic backups

## Migration Notes

The application uses a simple schema without migrations. If you need to modify the schema:

1. Add new columns with `ALTER TABLE` statements
2. Ensure columns have DEFAULT values or allow NULL
3. Update `dbService.js` to handle new fields
4. Test thoroughly before deploying

## Support

For Neon-specific issues:
- Documentation: https://neon.tech/docs
- Support: https://neon.tech/support

For application-specific database questions:
- Check `services/dbService.js` for implementation details
- Review `setup_db.sql` for the base schema
- Use the Admin Dashboard to inspect data
