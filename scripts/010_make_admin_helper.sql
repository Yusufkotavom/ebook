-- Helper script to make any user an admin
-- After a user signs up, run this script with their email to make them admin

-- Example usage:
-- SELECT make_user_admin('your-email@example.com');

-- To see all users:
SELECT email, created_at FROM auth.users ORDER BY created_at DESC;

-- To see all admins:
SELECT au.id, u.email, au.created_at 
FROM admin_users au 
JOIN auth.users u ON au.id = u.id;

-- To make a user admin (replace with actual email):
SELECT make_user_admin('admin@example.com');
