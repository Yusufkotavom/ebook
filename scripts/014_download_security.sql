-- ====================================
-- Download Security System
-- ====================================

-- Create download_token_logs table for tracking token generation
CREATE TABLE IF NOT EXISTS public.download_token_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  token_generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update download_logs table to include subscription and token info
ALTER TABLE public.download_logs 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS download_token_used TEXT,
ADD COLUMN IF NOT EXISTS download_method VARCHAR(50) DEFAULT 'token_based';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_download_token_logs_user_id ON public.download_token_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_download_token_logs_product_id ON public.download_token_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_download_token_logs_expires_at ON public.download_token_logs(expires_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_subscription_id ON public.download_logs(subscription_id);

-- Function to clean up expired token logs (optional cleanup)
CREATE OR REPLACE FUNCTION cleanup_expired_token_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.download_token_logs 
  WHERE expires_at < NOW() - INTERVAL '1 day';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get download statistics
CREATE OR REPLACE FUNCTION get_download_stats(
  user_uuid UUID DEFAULT NULL,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_downloads BIGINT,
  unique_books BIGINT,
  downloads_today BIGINT,
  most_downloaded_book TEXT,
  last_download_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_downloads,
    COUNT(DISTINCT dl.product_id) as unique_books,
    COUNT(*) FILTER (WHERE dl.downloaded_at::date = CURRENT_DATE) as downloads_today,
    (
      SELECT p.title 
      FROM public.download_logs dl2
      JOIN public.products p ON dl2.product_id = p.id
      WHERE (user_uuid IS NULL OR dl2.user_id = user_uuid)
        AND dl2.downloaded_at >= NOW() - (days_back || ' days')::INTERVAL
      GROUP BY p.title, dl2.product_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_downloaded_book,
    MAX(dl.downloaded_at) as last_download_date
  FROM public.download_logs dl
  WHERE (user_uuid IS NULL OR dl.user_id = user_uuid)
    AND dl.downloaded_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for download security tables
ALTER TABLE public.download_token_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own token logs
CREATE POLICY "Users can read their own token logs" ON public.download_token_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all token logs
CREATE POLICY "Admins can read all token logs" ON public.download_token_logs
  FOR SELECT USING (public.is_admin());

-- System can insert token logs
CREATE POLICY "System can insert token logs" ON public.download_token_logs
  FOR INSERT WITH CHECK (true);

-- Update download_logs policies to include subscription access
DROP POLICY IF EXISTS "Users can read their own downloads" ON public.download_logs;
CREATE POLICY "Users can read their own downloads" ON public.download_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all downloads" ON public.download_logs;
CREATE POLICY "Admins can read all downloads" ON public.download_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can log downloads" ON public.download_logs;
CREATE POLICY "System can log downloads" ON public.download_logs
  FOR INSERT WITH CHECK (true);

COMMENT ON TABLE public.download_token_logs IS 'Logs for download token generation with expiry tracking';
COMMENT ON TABLE public.download_logs IS 'Complete download activity logs with subscription tracking';
COMMENT ON FUNCTION cleanup_expired_token_logs() IS 'Clean up expired token logs to save storage';
COMMENT ON FUNCTION get_download_stats(UUID, INTEGER) IS 'Get download statistics for users or admin overview';