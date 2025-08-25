-- Update default currency from USD to IDR
-- This will ensure existing installations get the new default

-- Update the app_settings table to use IDR as default currency
UPDATE public.app_settings 
SET value = 'IDR', updated_at = NOW()
WHERE key = 'currency' AND value = 'USD';

-- If no currency setting exists, insert IDR as default
INSERT INTO public.app_settings (key, value, description) 
VALUES ('currency', 'IDR', 'Default currency for the store')
ON CONFLICT (key) DO UPDATE SET 
  value = 'IDR',
  updated_at = NOW();