-- Fix payment methods access for non-authenticated users
-- Allow public read access to active payment methods

-- Drop existing read policy for authenticated users only
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.payment_methods;

-- Create new policy allowing public read access to active payment methods
CREATE POLICY "Allow public read access to active payment methods" ON public.payment_methods
  FOR SELECT
  TO public
  USING (is_active = true);

-- Keep existing policies for admin operations
-- "Allow all operations for authenticated users" remains for admin functionality
-- "Allow all operations for service role" remains for service operations