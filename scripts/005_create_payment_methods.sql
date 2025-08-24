-- Create payment_methods table for storing bank accounts and e-wallet information
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank', 'ewallet')),
  name VARCHAR(100) NOT NULL, -- Bank name or e-wallet provider (BCA, OVO, Dana, etc.)
  account_number VARCHAR(50), -- Account number or phone number
  account_name VARCHAR(100), -- Account holder name
  instructions TEXT, -- Additional payment instructions
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_methods table
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users (customers need to see payment methods)
CREATE POLICY "Allow read access for authenticated users" ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow all operations for service role (admin)
CREATE POLICY "Allow all operations for service role" ON public.payment_methods
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert some default payment methods
INSERT INTO public.payment_methods (type, name, account_number, account_name, instructions, display_order) VALUES
('bank', 'Bank BCA', '1234567890', 'Toko Ebook Store', 'Transfer ke rekening BCA di atas, lalu upload bukti transfer', 1),
('bank', 'Bank Mandiri', '9876543210', 'Toko Ebook Store', 'Transfer ke rekening Mandiri di atas, lalu upload bukti transfer', 2),
('ewallet', 'OVO', '081234567890', 'Toko Ebook Store', 'Transfer ke OVO dengan nomor di atas, lalu screenshot bukti transfer', 3),
('ewallet', 'Dana', '081234567890', 'Toko Ebook Store', 'Transfer ke Dana dengan nomor di atas, lalu screenshot bukti transfer', 4),
('ewallet', 'GoPay', '081234567890', 'Toko Ebook Store', 'Transfer ke GoPay dengan nomor di atas, lalu screenshot bukti transfer', 5)
ON CONFLICT DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON public.payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_order ON public.payment_methods(display_order);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON public.payment_methods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();