-- ====================================
-- Subscription Packages System
-- ====================================

-- Create subscription_packages table
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER, -- NULL for lifetime
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
  features TEXT[], -- Array of features
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_package_id UUID NOT NULL REFERENCES public.subscription_packages(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE, -- NULL for lifetime
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only have one active subscription at a time
  CONSTRAINT unique_active_subscription UNIQUE (user_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Add updated_at trigger for subscription_packages
CREATE OR REPLACE FUNCTION update_subscription_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_packages_updated_at
  BEFORE UPDATE ON public.subscription_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_packages_updated_at();

-- Add updated_at trigger for user_subscriptions
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_id = user_uuid 
      AND is_active = true 
      AND (end_date IS NULL OR end_date > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_active_subscription(user_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  package_name VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  duration_days INTEGER,
  is_lifetime BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.name,
    us.start_date,
    us.end_date,
    sp.duration_days,
    (sp.duration_days IS NULL) as is_lifetime
  FROM public.user_subscriptions us
  JOIN public.subscription_packages sp ON us.subscription_package_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.is_active = true 
    AND (us.end_date IS NULL OR us.end_date > NOW())
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate subscription after payment
CREATE OR REPLACE FUNCTION activate_subscription(
  user_uuid UUID,
  package_uuid UUID,
  order_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  subscription_uuid UUID;
  package_duration INTEGER;
  calculated_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get package duration
  SELECT duration_days INTO package_duration
  FROM public.subscription_packages
  WHERE id = package_uuid AND is_active = true;
  
  IF package_duration IS NULL THEN
    -- Lifetime subscription
    calculated_end_date := NULL;
  ELSE
    -- Time-limited subscription
    calculated_end_date := NOW() + (package_duration || ' days')::INTERVAL;
  END IF;
  
  -- Deactivate any existing active subscriptions
  UPDATE public.user_subscriptions 
  SET is_active = false, updated_at = NOW()
  WHERE user_id = user_uuid AND is_active = true;
  
  -- Create new subscription
  INSERT INTO public.user_subscriptions (
    user_id, subscription_package_id, start_date, end_date, order_id
  ) VALUES (
    user_uuid, package_uuid, NOW(), calculated_end_date, order_uuid
  ) RETURNING id INTO subscription_uuid;
  
  RETURN subscription_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription packages
INSERT INTO public.subscription_packages (name, description, duration_days, price, features, is_featured, sort_order) VALUES 
(
  '1 Day Access', 
  'Get full access to all ebooks for 1 day. Perfect for quick reading sessions.',
  1,
  15000.00,
  ARRAY['Access to all ebooks', 'Unlimited downloads', 'Mobile friendly', '24/7 support'],
  false,
  1
),
(
  '30 Day Access', 
  'Get full access to all ebooks for 30 days. Great for regular readers.',
  30,
  99000.00,
  ARRAY['Access to all ebooks', 'Unlimited downloads', 'Mobile friendly', '30 days support', 'Priority customer service'],
  true,
  2
),
(
  'Lifetime Access', 
  'Get unlimited lifetime access to all ebooks. Best value for book lovers!',
  NULL,
  299000.00,
  ARRAY['Lifetime access to all ebooks', 'Unlimited downloads', 'Mobile friendly', 'Lifetime support', 'Priority customer service', 'Early access to new books'],
  true,
  3
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON public.user_subscriptions(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_packages_active ON public.subscription_packages(is_active, sort_order) WHERE is_active = true;

-- Add RLS policies
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscription packages policies
CREATE POLICY "Anyone can read active subscription packages" ON public.subscription_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription packages" ON public.subscription_packages
  FOR ALL USING (public.is_admin());

-- User subscriptions policies  
CREATE POLICY "Users can read their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete subscriptions" ON public.user_subscriptions
  FOR DELETE USING (public.is_admin());

COMMENT ON TABLE public.subscription_packages IS 'Subscription packages with different access durations';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription records with start/end dates';
COMMENT ON FUNCTION has_active_subscription(UUID) IS 'Check if user has an active subscription';
COMMENT ON FUNCTION get_active_subscription(UUID) IS 'Get user active subscription details';
COMMENT ON FUNCTION activate_subscription(UUID, UUID, UUID) IS 'Activate subscription after payment';