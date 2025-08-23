-- Create an admin user (replace with your actual email)
-- This script should be run after you've created your account

-- First, you need to sign up normally, then run this script with your user ID
-- You can get your user ID from the auth.users table or from the Supabase dashboard

-- Example: INSERT INTO public.admin_users (id) VALUES ('your-user-id-here');

-- For demo purposes, this creates a placeholder entry
-- Replace 'admin@example.com' with your actual admin email after signup
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find user by email (you'll need to replace this email)
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com' 
    LIMIT 1;
    
    -- If user exists, make them admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.admin_users (id) 
        VALUES (admin_user_id)
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Admin user created for: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No user found with email admin@example.com. Please update this script with your actual admin email.';
    END IF;
END $$;
