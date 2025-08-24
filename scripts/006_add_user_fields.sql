-- Add name and whatsapp_number fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);

-- Update RLS policies to include new fields (existing policies already cover these fields)
-- No additional policies needed as existing policies allow users to update their own profiles