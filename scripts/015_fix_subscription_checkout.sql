-- ====================================
-- Fix Subscription Checkout Support
-- ====================================

-- Make product_id nullable to support subscription items
ALTER TABLE public.order_items 
ALTER COLUMN product_id DROP NOT NULL;

-- Add subscription package reference to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS subscription_package_id UUID REFERENCES public.subscription_packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) DEFAULT 'product' CHECK (item_type IN ('product', 'subscription'));

-- Add constraint to ensure either product_id or subscription_package_id is present
ALTER TABLE public.order_items 
ADD CONSTRAINT valid_order_item CHECK (
  (product_id IS NOT NULL AND subscription_package_id IS NULL AND item_type = 'product') OR 
  (product_id IS NULL AND subscription_package_id IS NOT NULL AND item_type = 'subscription')
);

-- Create index for subscription package items
CREATE INDEX IF NOT EXISTS idx_order_items_subscription_package 
ON public.order_items(subscription_package_id) 
WHERE subscription_package_id IS NOT NULL;

-- Create index for item type
CREATE INDEX IF NOT EXISTS idx_order_items_type 
ON public.order_items(item_type);

-- Update the order total calculation function to handle subscriptions
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders 
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * price), 0)
    FROM public.order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to activate subscription after successful payment
CREATE OR REPLACE FUNCTION activate_subscription_from_order(order_uuid UUID)
RETURNS VOID AS $$
DECLARE
  order_record RECORD;
  subscription_item RECORD;
  new_subscription_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = order_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', order_uuid;
  END IF;
  
  -- Only activate if order is completed and paid
  IF order_record.status != 'completed' THEN
    RAISE EXCEPTION 'Order is not completed: %', order_record.status;
  END IF;
  
  -- Process each subscription item in the order
  FOR subscription_item IN 
    SELECT * FROM public.order_items 
    WHERE order_id = order_uuid 
    AND item_type = 'subscription'
    AND subscription_package_id IS NOT NULL
  LOOP
    -- Activate the subscription
    SELECT activate_subscription(
      order_record.user_id, 
      subscription_item.subscription_package_id, 
      order_uuid
    ) INTO new_subscription_id;
    
    RAISE NOTICE 'Activated subscription % for user %', new_subscription_id, order_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order details with subscription information
CREATE OR REPLACE FUNCTION get_order_with_subscriptions(order_uuid UUID)
RETURNS TABLE (
  order_id UUID,
  total_amount DECIMAL,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  has_subscriptions BOOLEAN,
  subscription_packages JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.total_amount,
    o.status,
    o.created_at,
    EXISTS(
      SELECT 1 FROM public.order_items oi 
      WHERE oi.order_id = o.id AND oi.item_type = 'subscription'
    ) as has_subscriptions,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'package_id', sp.id,
          'name', sp.name,
          'duration_days', sp.duration_days,
          'price', oi.price
        )
      ) FILTER (WHERE sp.id IS NOT NULL),
      '[]'::json
    ) as subscription_packages
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id AND oi.item_type = 'subscription'
  LEFT JOIN public.subscription_packages sp ON oi.subscription_package_id = sp.id
  WHERE o.id = order_uuid
  GROUP BY o.id, o.total_amount, o.status, o.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for new columns
-- (Existing policies should cover the new columns automatically)

COMMENT ON COLUMN public.order_items.subscription_package_id IS 'Reference to subscription package for subscription items';
COMMENT ON COLUMN public.order_items.item_type IS 'Type of item: product or subscription';
COMMENT ON FUNCTION activate_subscription_from_order(UUID) IS 'Activate all subscriptions in a completed order';
COMMENT ON FUNCTION get_order_with_subscriptions(UUID) IS 'Get order details including subscription information';