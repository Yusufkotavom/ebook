-- Add guest name and WhatsApp fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_whatsapp TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_guest_name ON public.orders(guest_name);
CREATE INDEX IF NOT EXISTS idx_orders_guest_whatsapp ON public.orders(guest_whatsapp);