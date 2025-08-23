-- Simple script to make any existing user an admin
-- Usage: Replace the email below with the email of the user you want to make admin

-- Step 1: First sign up normally through the app with your desired admin email
-- Step 2: Then run this script, replacing 'admin@test.com' with your email

INSERT INTO admin_users (id, created_at)
SELECT 
  auth.users.id,
  NOW()
FROM auth.users 
WHERE auth.users.email = 'admin@test.com'  -- Replace with your admin email
ON CONFLICT (id) DO NOTHING;

-- Verify admin was created
SELECT 
  u.email,
  u.created_at as user_created,
  a.created_at as admin_created
FROM auth.users u
JOIN admin_users a ON u.id = a.id
WHERE u.email = 'admin@test.com';  -- Replace with your admin email
