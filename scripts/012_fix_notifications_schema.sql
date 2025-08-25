-- Fix notifications table to support manual notifications without order_id
-- The original schema required order_id NOT NULL, but manual notifications don't always have an order

-- Make order_id nullable for manual notifications
ALTER TABLE public.notifications 
ALTER COLUMN order_id DROP NOT NULL;

-- Add a constraint to ensure either order_id exists OR it's a manual notification
-- Manual notifications should have a subject, while order notifications might not
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (
  (order_id IS NOT NULL) OR 
  (order_id IS NULL AND subject IS NOT NULL)
);

-- Ensure the table has proper structure
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Update the foreign key constraint to handle nulls properly
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_order_id_fkey;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Create proper indexes
CREATE INDEX IF NOT EXISTS notifications_order_id_idx ON public.notifications(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_sent_at_idx ON public.notifications(sent_at);

-- Grant permissions
GRANT SELECT, INSERT ON public.notifications TO authenticated;