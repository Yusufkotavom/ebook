-- ========================================
-- 017_fix_existing_subscriptions.sql
-- Fix existing paid subscription orders that don't have user subscriptions
-- ========================================

-- First, let's see what we're working with
DO $$
DECLARE
    order_record RECORD;
    subscription_item RECORD;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
    subscription_id UUID;
BEGIN
    -- Loop through all paid orders with subscription items
    FOR order_record IN 
        SELECT DISTINCT o.id, o.user_id, o.created_at
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = 'paid' 
        AND oi.item_type = 'subscription'
        AND oi.subscription_package_id IS NOT NULL
    LOOP
        -- Check if subscription already exists for this order
        IF NOT EXISTS (
            SELECT 1 FROM user_subscriptions 
            WHERE order_id = order_record.id
        ) THEN
            
            -- If user already has an active subscription, deactivate it first
            IF order_record.user_id IS NOT NULL THEN
                UPDATE user_subscriptions 
                SET is_active = false, updated_at = NOW()
                WHERE user_id = order_record.user_id AND is_active = true;
                
                RAISE NOTICE 'Deactivated existing subscription for user %', order_record.user_id;
            END IF;
            
            -- Get subscription items for this order
            FOR subscription_item IN
                SELECT 
                    oi.subscription_package_id,
                    sp.name,
                    sp.duration_days
                FROM order_items oi
                JOIN subscription_packages sp ON oi.subscription_package_id = sp.id
                WHERE oi.order_id = order_record.id
                AND oi.item_type = 'subscription'
            LOOP
                -- Calculate subscription dates based on order creation date
                start_date := order_record.created_at;
                end_date := start_date + (subscription_item.duration_days || ' days')::INTERVAL;
                
                -- Create the subscription record
                INSERT INTO user_subscriptions (
                    user_id,
                    subscription_package_id,
                    start_date,
                    end_date,
                    is_active,
                    order_id,
                    created_at,
                    updated_at
                ) VALUES (
                    order_record.user_id,
                    subscription_item.subscription_package_id,
                    start_date,
                    end_date,
                    true,
                    order_record.id,
                    NOW(),
                    NOW()
                ) RETURNING id INTO subscription_id;
                
                RAISE NOTICE 'Created subscription % for order % with package % (duration: % days)', 
                    subscription_id, 
                    order_record.id, 
                    subscription_item.name, 
                    subscription_item.duration_days;
            END LOOP;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Finished processing existing subscription orders';
END $$;

-- Verify the fix
SELECT 
    o.id as order_id,
    o.status,
    o.created_at as order_date,
    sp.name as package_name,
    sp.duration_days,
    us.start_date,
    us.end_date,
    us.is_active
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN subscription_packages sp ON oi.subscription_package_id = sp.id
LEFT JOIN user_subscriptions us ON o.id = us.order_id
WHERE oi.item_type = 'subscription'
AND o.status = 'paid'
ORDER BY o.created_at DESC;
