-- ========================================
-- 02_products.sql
-- Product Management & Catalog
-- ========================================

-- Create products table with all necessary fields
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url TEXT,
  download_url TEXT,
  is_active BOOLEAN DEFAULT true,
  category TEXT,
  tags TEXT[], -- Array for multiple tags
  isbn TEXT,
  page_count INTEGER,
  file_size_mb DECIMAL(5,2),
  language TEXT DEFAULT 'Indonesian',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger to products
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create full-text search column for better search performance
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('indonesian', 
    COALESCE(title, '') || ' ' || 
    COALESCE(author, '') || ' ' || 
    COALESCE(publisher, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(category, '') || ' ' ||
    COALESCE(array_to_string(tags, ' '), '')
  )
) STORED;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS products_search_idx ON public.products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS products_active_idx ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS products_price_idx ON public.products(price);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_author_idx ON public.products(author);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS products_title_idx ON public.products(title);

-- Grant permissions
GRANT ALL ON public.products TO postgres, service_role;
GRANT SELECT ON public.products TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 2 Complete: Products table with full-text search created successfully';
END $$;