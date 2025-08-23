-- Fix admin_users table and create simple admin setup
-- The admin_users table should just link user IDs to admin status

-- First, let's make sure we have the right structure
-- The table should just store which user IDs are admins

-- Create a simple function to make any user an admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Insert into admin_users if not already there
    INSERT INTO admin_users (id, created_at)
    VALUES (user_id, now())
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'User % is now an admin', user_email;
END;
$$ LANGUAGE plpgsql;

-- Make the default admin user (change this email to your actual email)
-- You can run: SELECT make_user_admin('your-email@example.com');
