-- ========================================
-- 06_app_settings.sql
-- Global Store Settings & Configuration
-- ========================================

-- Create app_settings table for global store configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Whether setting can be read by public
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings(setting_key);
CREATE INDEX IF NOT EXISTS app_settings_public_idx ON public.app_settings(is_public) WHERE is_public = true;

-- Insert default settings
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('currency', 'IDR', 'string', 'Default store currency', true),
('store_name', 'Ebook Store', 'string', 'Store name', true),
('store_description', 'Your one-stop destination for digital books', 'string', 'Store description', true),
('contact_email', 'support@ebookstore.com', 'string', 'Store contact email', true),
('contact_whatsapp', '6285799520350', 'string', 'Store WhatsApp number', true),
('items_per_page', '50', 'number', 'Default items per page for pagination', true),
('max_items_per_page', '100', 'number', 'Maximum items per page allowed', false),
('enable_guest_checkout', 'true', 'boolean', 'Allow guest checkout without registration', false),
('auto_approve_payments', 'false', 'boolean', 'Automatically approve manual payments', false),
('featured_categories', '["Technology", "Business", "Education"]', 'json', 'Featured product categories', true),
('social_links', '{"facebook": "", "instagram": "", "twitter": ""}', 'json', 'Social media links', true),
-- Email Configuration Settings
('email_provider', 'brevo_api', 'string', 'Email service provider (brevo_api or brevo_smtp)', false),
('email_from_address', 'noreply@yourdomain.com', 'string', 'Default from email address', false),
('email_from_name', 'Ebook Store', 'string', 'Default from name', false),
('email_reply_to', 'support@yourdomain.com', 'string', 'Reply-to email address', false),
('brevo_api_key', '', 'string', 'Brevo API key for email service', false),
('smtp_host', 'smtp-relay.brevo.com', 'string', 'SMTP server host', false),
('smtp_port', '587', 'number', 'SMTP server port', false),
('smtp_user', '', 'string', 'SMTP username', false),
('smtp_pass', '', 'string', 'SMTP password', false),
('email_notifications_enabled', 'true', 'boolean', 'Enable automatic email notifications', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.app_settings TO postgres, service_role;
GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 6 Complete: App Settings table created with default values';
END $$;