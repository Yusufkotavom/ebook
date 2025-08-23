-- Create default admin user for testing
-- This script creates an admin user that can log into the admin dashboard

-- First, create a regular user account (this would normally be done through signup)
-- For testing, we'll create a simple admin entry

-- Add admin user to admin_users table
INSERT INTO public.admin_users (
  id,
  created_at
) VALUES (
  gen_random_uuid(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Simplified admin creation - just use the admin_users table
-- For local testing, follow these steps:
-- 1. Sign up normally at /auth/sign-up with email: admin@test.com, password: admin123
-- 2. After signup, run this query to make that user an admin:
--    INSERT INTO admin_users (id) SELECT id FROM auth.users WHERE email = 'admin@test.com';

-- Alternative: Create admin directly (requires manual user creation first)
-- Replace 'your-user-id-here' with the actual user ID from auth.users table
-- INSERT INTO admin_users (id) VALUES ('your-user-id-here');
