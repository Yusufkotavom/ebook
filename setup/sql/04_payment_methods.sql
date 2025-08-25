-- ========================================
-- 04_payment_methods.sql
-- Payment Methods Management
-- ========================================

-- Create payment_methods table for manual payment system
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "Bank BCA", "OVO", "Dana"
  type TEXT NOT NULL CHECK (type IN ('bank', 'ewallet', 'crypto', 'other')),
  account_number TEXT NOT NULL, -- Bank account, phone number, wallet address
  account_name TEXT, -- Account holder name
  instructions TEXT NOT NULL, -- Payment instructions for customers
  qr_code_url TEXT, -- Optional QR code for payments
  logo_url TEXT, -- Optional logo/icon
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0, -- For custom ordering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS payment_methods_active_idx ON public.payment_methods(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON public.payment_methods(type);
CREATE INDEX IF NOT EXISTS payment_methods_sort_idx ON public.payment_methods(sort_order, created_at);

-- Grant permissions (public read access for active payment methods)
GRANT ALL ON public.payment_methods TO postgres, service_role;
GRANT SELECT ON public.payment_methods TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 4 Complete: Payment Methods table created successfully';
END $$;