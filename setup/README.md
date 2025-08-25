# 🚀 Ebook Store - Complete Supabase Setup Guide

This guide will help you set up a brand new Supabase database for the Ebook Store application.

## 📋 Prerequisites

- A Supabase account ([supabase.com](https://supabase.com))
- Access to Supabase SQL Editor
- Basic understanding of SQL

## 🎯 Setup Overview

This setup includes:
- **User Authentication & Profiles**
- **Product Management** (5000+ ebooks support)
- **Shopping Cart & Orders**
- **Payment Methods** (manual payment system)
- **Admin Dashboard** with full CRUD
- **Notification System** (email & WhatsApp)
- **Currency Settings** (global store settings)
- **Pagination & Performance** optimizations

## 📁 File Structure

```
setup/
├── README.md                           # This documentation
├── sql/
│   ├── 01_auth_and_profiles.sql       # User authentication and profiles
│   ├── 02_products.sql                # Products table with indexes
│   ├── 03_orders_and_items.sql        # Orders and order items
│   ├── 04_payment_methods.sql         # Payment methods management
│   ├── 05_notifications.sql           # Notification system
│   ├── 06_app_settings.sql            # Global store settings
│   ├── 07_admin_users.sql             # Admin user management
│   ├── 08_row_level_security.sql      # Security policies
│   ├── 09_indexes_and_performance.sql # Performance optimizations
│   └── 10_sample_data.sql             # Sample data for testing
├── .env.template                      # Environment variables template
└── verification.sql                   # Database verification script
```

## 🛠️ Step-by-Step Setup

### Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click **"New Project"**
4. Choose your organization
5. Fill in project details:
   - **Name**: `ebook-store` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click **"Create new project"**
7. Wait for project initialization (2-3 minutes)

### Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Key** (anon/public key)
   - **Service Role Key** (for admin operations)

### Step 3: Configure Environment Variables

1. Copy `.env.template` to `.env.local` in your project root
2. Fill in your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Configuration (for direct connections if needed)
DATABASE_URL=your_database_url_here
```

### Step 4: Run SQL Scripts in Order

⚠️ **IMPORTANT**: Run these scripts in the exact order listed. Each script builds on the previous ones.

Go to your Supabase project → **SQL Editor** → **New Query** and run each script:

1. **01_auth_and_profiles.sql** - User authentication and profiles
2. **02_products.sql** - Products table with full-text search
3. **03_orders_and_items.sql** - Orders and order items
4. **04_payment_methods.sql** - Payment methods management
5. **05_notifications.sql** - Notification system
6. **06_app_settings.sql** - Global store settings (currency, etc.)
7. **07_admin_users.sql** - Admin user management
8. **08_row_level_security.sql** - Security policies
9. **09_indexes_and_performance.sql** - Performance optimizations
10. **10_sample_data.sql** - Sample data for testing (optional)

### Step 5: Verify Setup

1. Run **verification.sql** to check all tables and relationships
2. Check the output for any errors
3. All tables should be created successfully

### Step 6: Configure Admin Access

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Create your first admin user or use existing user
3. Copy the user's UUID
4. Run this SQL to make the user an admin:

```sql
INSERT INTO public.admin_users (id) VALUES ('your_user_uuid_here');
```

### Step 7: Test the Application

1. Update your `.env.local` with the new Supabase credentials
2. Restart your development server
3. Test basic functionality:
   - User registration/login
   - Product browsing
   - Cart functionality
   - Admin dashboard access

## 🔧 Configuration Options

### Currency Settings

The default currency is set to Indonesian Rupiah (IDR). To change:

```sql
UPDATE public.app_settings 
SET setting_value = 'USD'  -- or any currency code
WHERE setting_key = 'currency';
```

### Payment Methods

Add your payment methods:

```sql
INSERT INTO public.payment_methods (name, type, account_number, instructions, is_active) VALUES
('Bank BCA', 'bank', '1234567890', 'Transfer to BCA account', true),
('OVO', 'ewallet', '081234567890', 'Send to OVO number', true);
```

### Sample Products

The sample data includes 10 example ebooks. Add your own products through the admin dashboard or via SQL.

## 🚨 Security Notes

1. **RLS (Row Level Security)** is enabled on all tables
2. **Admin users** have full access through policies
3. **Regular users** can only access their own data
4. **Guest checkout** is supported for orders
5. **Public access** for products and payment methods (read-only)

## 📊 Database Schema Overview

### Core Tables
- `profiles` - User profile information
- `products` - Ebook catalog
- `orders` - Customer orders
- `order_items` - Items within orders
- `payment_methods` - Available payment options
- `notifications` - Email/WhatsApp notification log
- `app_settings` - Global store configuration
- `admin_users` - Admin access control

### Key Relationships
```
profiles ←→ orders (user_id)
orders ←→ order_items (order_id)
order_items ←→ products (product_id)
orders ←→ notifications (order_id)
```

## 🔍 Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Make sure you're authenticated when testing
   - Check if user is in `admin_users` table for admin operations

2. **Relationship Errors**
   - Verify foreign key constraints in verification script
   - Check that UUIDs are properly formatted

3. **Permission Errors**
   - Run step 8 (RLS policies) to ensure proper permissions
   - Grant necessary permissions to authenticated users

4. **Performance Issues**
   - Run step 9 (indexes) for optimized queries
   - Consider enabling database optimizations in Supabase settings

### Verification Commands

Check table creation:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Check RLS policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

Check indexes:
```sql
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

## 🎉 Next Steps

After successful setup:

1. **Configure your application** with new environment variables
2. **Add your products** through admin dashboard
3. **Set up payment methods** for your region
4. **Configure WhatsApp** integration (optional)
5. **Set up email** notifications (optional)
6. **Deploy your application** with new database

## 📞 Support

If you encounter issues:
1. Check the verification script output
2. Review Supabase logs for detailed error messages
3. Ensure all SQL scripts ran without errors
4. Verify environment variables are correct

---

**🚀 Your Ebook Store is ready to go!**

This setup provides a complete, scalable, and secure foundation for your ebook business with support for thousands of products, multiple payment methods, and comprehensive admin management.