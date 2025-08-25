-- ========================================
-- 016_fix_app_settings_schema.sql
-- Fix app_settings table schema and add email settings
-- ========================================

-- First, check if we need to migrate from old schema (key, value) to new schema (setting_key, setting_value)
DO $$
BEGIN
    -- Check if old schema exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_settings' AND column_name = 'key'
    ) THEN
        -- Create new table with correct schema
        CREATE TABLE IF NOT EXISTS public.app_settings_new (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            setting_key TEXT NOT NULL UNIQUE,
            setting_value TEXT NOT NULL,
            setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
            description TEXT,
            is_public BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Copy existing data from old table to new table
        INSERT INTO public.app_settings_new (setting_key, setting_value, setting_type, description, is_public, created_at, updated_at)
        SELECT 
            key as setting_key,
            value as setting_value,
            'string' as setting_type,
            COALESCE(description, 'Migrated setting') as description,
            false as is_public,
            created_at,
            updated_at
        FROM public.app_settings
        ON CONFLICT (setting_key) DO NOTHING;

        -- Drop old table and rename new table
        DROP TABLE public.app_settings;
        ALTER TABLE public.app_settings_new RENAME TO app_settings;
        
        RAISE NOTICE '✅ Migrated app_settings table from old schema to new schema';
    ELSE
        RAISE NOTICE '✅ App_settings table already has correct schema';
    END IF;
END $$;

-- Ensure the table has the correct structure
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS app_settings_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings(setting_key);
CREATE INDEX IF NOT EXISTS app_settings_public_idx ON public.app_settings(is_public) WHERE is_public = true;

-- Insert or update email configuration settings
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
-- Store Settings
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
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public,
    updated_at = NOW();

-- Grant permissions
GRANT ALL ON public.app_settings TO postgres, service_role;
GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Step 16 Complete: App Settings table schema fixed and email settings added';
END $$;
