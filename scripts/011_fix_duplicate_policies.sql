-- Fix duplicate policies and relationship issues
-- First, drop existing policies if they exist, then recreate them

-- Drop existing policies that might be duplicated
DROP POLICY IF EXISTS "Allow admin to read all profiles for orders" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to read all orders" ON public.orders;

-- Recreate policies with proper conditions
CREATE POLICY "admin_read_profiles" ON public.profiles
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "admin_read_orders" ON public.orders
FOR SELECT 
TO authenticated
USING (true);

-- Ensure proper relationships exist
-- The notifications table should have order_id properly referencing orders
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_order_id_fkey;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Grant proper permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.products TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notifications_order_id_idx ON public.notifications(order_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);

-- Ensure the notifications table structure is correct
-- Add subject column if it doesn't exist (for manual notifications)
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS subject TEXT;