-- ========================================
-- 05_notifications.sql
-- Notification System (Email & WhatsApp)
-- ========================================

-- Create notifications table for tracking sent communications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE, -- Nullable for manual notifications
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms')),
  recipient TEXT NOT NULL, -- Email address, phone number, etc.
  subject TEXT, -- Email subject or notification title
  message TEXT NOT NULL, -- Message content
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  
  -- Metadata
  sent_by UUID REFERENCES auth.users(id), -- Admin who sent manual notification
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT, -- If sending failed
  
  -- Template info (if using templates)
  template_name TEXT,
  template_variables JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either order_id exists OR it's a manual notification with subject
  CONSTRAINT valid_notification CHECK (
    (order_id IS NOT NULL) OR 
    (order_id IS NULL AND subject IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS notifications_order_id_idx ON public.notifications(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON public.notifications(recipient);
CREATE INDEX IF NOT EXISTS notifications_sent_at_idx ON public.notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON public.notifications(status);

-- Grant permissions
GRANT ALL ON public.notifications TO postgres, service_role;
GRANT SELECT, INSERT ON public.notifications TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 5 Complete: Notifications table created successfully';
END $$;