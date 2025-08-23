-- Simple script to create admin user
-- First, you need to sign up normally through the app, then run this script with your email

-- Replace 'your-email@example.com' with the actual email you used to sign up
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID for the email (replace with your actual email)
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'admin@ebookstore.com';
    
    -- If user exists, make them admin
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.admin_users (id) 
        VALUES (user_uuid) 
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Admin user created for: %', user_uuid;
    ELSE
        RAISE NOTICE 'User not found. Please sign up first with email: admin@ebookstore.com';
    END IF;
END $$;

-- Alternative: Create admin for any email by replacing the email below
-- UPDATE THIS EMAIL TO YOUR ACTUAL EMAIL AFTER SIGNING UP:
-- 
-- DO $$
-- DECLARE
--     user_uuid UUID;
-- BEGIN
--     SELECT id INTO user_uuid 
--     FROM auth.users 
--     WHERE email = 'YOUR_ACTUAL_EMAIL@example.com';
--     
--     IF user_uuid IS NOT NULL THEN
--         INSERT INTO public.admin_users (id) 
--         VALUES (user_uuid) 
--         ON CONFLICT (id) DO NOTHING;
--         RAISE NOTICE 'Admin user created for: %', user_uuid;
--     END IF;
-- END $$;
