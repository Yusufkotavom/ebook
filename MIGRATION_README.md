# 🔧 Database Migration Guide

## Issue
The `app_settings` table has inconsistent schema between different setup scripts:
- **Old schema**: `key`, `value` columns
- **New schema**: `setting_key`, `setting_value` columns

This causes errors when trying to send emails because the API routes expect the new schema.

## Solution
Run the migration script `016_fix_app_settings_schema.sql` to:
1. Fix the table schema
2. Add missing email settings
3. Preserve existing data

## How to Run

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/016_fix_app_settings_schema.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db reset --db-url "your-database-url"
```

### Option 3: Using psql
```bash
psql "your-database-connection-string" -f scripts/016_fix_app_settings_schema.sql
```

## What the Migration Does

1. **Detects old schema**: Checks if table has `key` column
2. **Creates new table**: With correct `setting_key`, `setting_value` structure
3. **Migrates data**: Copies existing settings to new structure
4. **Adds email settings**: All necessary email configuration fields
5. **Updates permissions**: Sets proper RLS policies

## After Migration

1. **Test email functionality**:
   - Go to Admin → Settings → Email
   - Configure your Brevo API key
   - Send a test email

2. **Verify checkout emails**:
   - Create a test order
   - Check if confirmation email is sent

3. **Test payment reminders**:
   - Create an order and wait 6+ hours
   - Run the cron job manually to test

## Troubleshooting

### If migration fails:
1. Check database permissions
2. Ensure you have admin access
3. Check for any existing triggers or constraints

### If emails still don't work:
1. Verify Brevo API key is set
2. Check admin email settings form
3. Look at browser console for errors

## Rollback (if needed)
```sql
-- Only if you need to rollback
-- This will lose all settings data
DROP TABLE IF EXISTS app_settings;
-- Then re-run your original setup scripts
```

## Support
If you encounter issues:
1. Check the migration logs
2. Verify database connection
3. Contact support team
