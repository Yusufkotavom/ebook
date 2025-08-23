-- Add missing columns to support guest checkout and user profiles

-- Add guest_email column to orders table for guest checkout support
ALTER TABLE orders ADD COLUMN guest_email TEXT;

-- Add full_name column to profiles table for user information
ALTER TABLE profiles ADD COLUMN full_name TEXT;

-- Update orders table to make user_id nullable for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or guest_email is provided
ALTER TABLE orders ADD CONSTRAINT check_user_or_guest 
CHECK (
  (user_id IS NOT NULL AND guest_email IS NULL) OR 
  (user_id IS NULL AND guest_email IS NOT NULL)
);
