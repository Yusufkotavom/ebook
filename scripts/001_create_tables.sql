-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  download_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products (public read, admin write)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products policies - anyone can read active products
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active = true);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Made nullable for guest checkout
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT DEFAULT 'manual',
  guest_email TEXT, -- Added guest email field for non-authenticated orders
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Updated orders policies to handle guest checkout
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR user_id IS NULL
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (
  auth.uid() = user_id OR user_id IS NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Updated order items policies to handle guest checkout
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
));

CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
));

-- Create notifications table for admin to track manual notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on notifications (admin only)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create admin_users table to track who has admin access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "admin_users_select_own" ON public.admin_users FOR SELECT USING (auth.uid() = id);

-- Notifications policies - only admins can access
CREATE POLICY "notifications_admin_only" ON public.notifications FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid()));

-- Add admin policies for products and orders management
CREATE POLICY "products_admin_all" ON public.products FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "orders_admin_all" ON public.orders FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid()));
