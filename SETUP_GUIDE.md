# 🚀 Complete Setup Guide - Ebook Store

This guide will walk you through setting up the Ebook Store from scratch. Follow each step carefully to ensure everything works correctly.

## 📋 **Pre-Setup Checklist**

Before starting, make sure you have:
- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **Git** installed ([Download here](https://git-scm.com/))
- [ ] **Supabase account** ([Sign up here](https://supabase.com/))
- [ ] **Brevo account** for emails ([Sign up here](https://www.brevo.com/))
- [ ] **Code editor** (VS Code recommended)
- [ ] **Terminal/Command prompt** access

---

## 🔧 **Step 1: Project Setup**

### **1.1 Clone the Repository**
```bash
# Clone the project
git clone https://github.com/Yusufkotavom/ebook.git

# Navigate to project directory
cd ebook

# Check current branch
git branch -a
```

**Expected Output:**
```
* feature/subscription-system
  master
```

### **1.2 Install Dependencies**
```bash
# Install all required packages
npm install

# Verify installation
npm list --depth=0
```

**Expected Packages:**
- `@getbrevo/brevo` - Email service
- `@supabase/supabase-js` - Database client
- `jsonwebtoken` - Token security
- `next` - React framework
- `react-hot-toast` - Notifications
- And many more...

### **1.3 Verify Project Structure**
```
ebook/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── books/             # Book library page
│   ├── dashboard/         # User dashboard
│   ├── subscriptions/     # Subscription plans
│   └── api/               # API endpoints
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── scripts/               # Database scripts
├── setup/                 # Setup SQL files
└── types/                 # TypeScript definitions
```

---

## 🗄️ **Step 2: Database Setup (Supabase)**

### **2.1 Create Supabase Project**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - **Name**: `ebook-store-production`
   - **Database Password**: `Generate a strong password and SAVE IT`
   - **Region**: `Choose closest to your users`
   - **Pricing Plan**: `Free tier to start`

4. **Click "Create new project"**
5. **Wait 2-3 minutes** for project initialization

### **2.2 Get Supabase Credentials**

1. **Go to Settings → API**
2. **Copy these values** (you'll need them later):
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **2.3 Run Database Setup Scripts**

**Important:** Run these SQL scripts **in exact order** in Supabase SQL Editor:

#### **Script 1: Authentication & Profiles**
```sql
-- Copy entire content from: setup/sql/01_auth_and_profiles.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Query executed successfully`

#### **Script 2: Products Management**
```sql
-- Copy entire content from: setup/sql/02_products.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Products table created with search capabilities`

#### **Script 3: Orders System**
```sql
-- Copy entire content from: setup/sql/03_orders_and_items.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Orders and order_items tables created`

#### **Script 4: Payment Methods**
```sql
-- Copy entire content from: setup/sql/04_payment_methods.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Payment methods system ready`

#### **Script 5: Notifications**
```sql
-- Copy entire content from: setup/sql/05_notifications.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Notification system with manual emails`

#### **Script 6: App Settings (IMPORTANT - Includes Email Config)**
```sql
-- Copy entire content from: setup/sql/06_app_settings.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Global settings including Brevo email config`

#### **Script 7: Admin Users**
```sql
-- Copy entire content from: setup/sql/07_admin_users.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Admin role system created`

#### **Script 8: Security Policies**
```sql
-- Copy entire content from: setup/sql/08_row_level_security.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `RLS policies for all tables`

#### **Script 9: Performance Optimization**
```sql
-- Copy entire content from: setup/sql/09_indexes_and_performance.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Indexes and performance functions created`

#### **Script 10: Sample Data**
```sql
-- Copy entire content from: setup/sql/10_sample_data.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Sample payment methods and books inserted`

#### **Script 11: Subscription Packages**
```sql
-- Copy entire content from: scripts/013_subscription_packages.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `Subscription system with 3 plans created`

#### **Script 12: Download Security**
```sql
-- Copy entire content from: scripts/014_download_security.sql
-- Paste in Supabase SQL Editor → Click "Run"
```
✅ **Expected Result**: `JWT download token system ready`

### **2.4 Verify Database Setup**
```sql
-- Copy entire content from: setup/verification.sql
-- Paste in Supabase SQL Editor → Click "Run"
```

**Expected Output:**
```
✅ All 9 required tables created successfully
✅ 15+ RLS policies created successfully  
✅ All required functions created successfully
✅ Performance indexes created successfully
✅ Default app settings inserted successfully
✅ Sample products inserted successfully
✅ Payment methods configured successfully
✅ Subscription packages ready (3 plans)
✅ Download security system active

🎉 DATABASE SETUP VERIFICATION SUCCESSFUL!
```

---

## 🔑 **Step 3: Environment Configuration**

### **3.1 Create Environment File**
```bash
# Create environment file
cp .env.template .env.local

# Or create manually
touch .env.local
```

### **3.2 Configure Supabase Settings**
Edit `.env.local` and add your Supabase credentials:

```env
# ========================================
# Supabase Configuration
# ========================================

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# Database Configuration  
# ========================================

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# ========================================
# Application Configuration
# ========================================

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Ebook Store
```

### **3.3 Configure Brevo Email Service**

1. **Sign up for Brevo** at [brevo.com](https://www.brevo.com/)
2. **Get API credentials** from Brevo dashboard
3. **Add to `.env.local`:**

```env
# ========================================
# Email Configuration (Brevo)
# ========================================

BREVO_API_KEY=xkeysib-your-api-key-here
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Ebook Store
EMAIL_REPLY_TO=support@yourdomain.com
```

### **3.4 Configure Download Security**
```env
# ========================================
# Download Security
# ========================================

# Generate a strong JWT secret (32+ characters)
DOWNLOAD_JWT_SECRET=your-super-secret-jwt-key-for-download-tokens-change-this-in-production
DOWNLOAD_TOKEN_EXPIRY_MINUTES=15
```

### **3.5 Configure WhatsApp Integration**
```env
# ========================================
# WhatsApp Configuration
# ========================================

WHATSAPP_NUMBER=6285799520350
```

### **3.6 Final Environment File Check**
Your complete `.env.local` should look like this:
```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# App (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Ebook Store

# Email (OPTIONAL but recommended)
BREVO_API_KEY=xkeysib-your-api-key
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Ebook Store
EMAIL_REPLY_TO=support@yourdomain.com

# Security (REQUIRED)
DOWNLOAD_JWT_SECRET=your-super-secret-jwt-key-for-download-tokens
DOWNLOAD_TOKEN_EXPIRY_MINUTES=15

# WhatsApp (OPTIONAL)
WHATSAPP_NUMBER=6285799520350
```

---

## 🚀 **Step 4: First Run & Testing**

### **4.1 Start Development Server**
```bash
# Start the development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

### **4.2 Test Homepage**
1. **Open browser** to `http://localhost:3000`
2. **Expected to see:**
   - ✅ Homepage with sample books
   - ✅ Navigation working
   - ✅ Mobile responsive design
   - ✅ No console errors

### **4.3 Test Core Pages**

#### **Public Pages Test:**
- [ ] **`/`** - Homepage loads with books
- [ ] **`/books`** - Book library page works
- [ ] **`/subscriptions`** - Subscription plans display
- [ ] **`/auth/login`** - Login form appears
- [ ] **`/auth/sign-up`** - Registration form works

#### **API Endpoints Test:**
```bash
# Test subscription packages API
curl http://localhost:3000/api/subscriptions/packages

# Expected: JSON with 3 subscription plans
```

### **4.4 Create Admin User**

1. **Register a new account:**
   - Go to `/auth/sign-up`
   - Fill in details and register
   - Note your email for later

2. **Get user UUID:**
   - Go to Supabase Dashboard
   - Navigate to **Authentication → Users**
   - Find your user and **copy the UUID**

3. **Make user admin:**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO public.admin_users (id) VALUES ('your-user-uuid-here');
   ```

4. **Test admin access:**
   - Login to your account
   - Visit `/admin/dashboard`
   - Should see admin panel (not 403 error)

---

## 💳 **Step 5: Payment & Email Setup**

### **5.1 Configure Payment Methods**

1. **Login as admin**
2. **Go to `/admin/settings/payment-methods`**
3. **Add payment methods:**
   - **Bank Transfer**: BCA, Mandiri, BRI
   - **E-Wallet**: OVO, Dana, GoPay
   - **Instructions**: Clear payment steps

### **5.2 Test Email Configuration**

1. **Go to `/admin/settings/email`**
2. **Configure Brevo settings:**
   - Select **Brevo API** or **SMTP**
   - Enter your Brevo credentials
   - Set sender information

3. **Send test email:**
   - Enter your email address
   - Click **"Send Test Email"**
   - Check your inbox for test message

### **5.3 Test Subscription Flow**

1. **Go to `/subscriptions`**
2. **Choose a plan** (start with 1-day)
3. **Add to cart**
4. **Complete checkout process**
5. **Verify subscription activation**

---

## 📱 **Step 6: Mobile Testing**

### **6.1 Test Mobile Responsiveness**
- [ ] **Bottom navigation** appears on mobile
- [ ] **Touch interactions** work properly
- [ ] **Subscription cards** display correctly
- [ ] **Forms are usable** on small screens

### **6.2 Test Key User Flows**

#### **Guest User Flow:**
1. Browse books → Can see but not download
2. Go to subscriptions → Prompted to login
3. Register account → Successful signup
4. Subscribe to plan → Can now download

#### **Registered User Flow:**
1. Login → Dashboard access
2. Browse books → See subscription status
3. Download books → Token-based download
4. Manage profile → Update personal info

---

## 🔒 **Step 7: Security Testing**

### **7.1 Test Download Token Security**

1. **Subscribe to any plan**
2. **Go to `/books`**
3. **Click download** on any book
4. **Verify process:**
   - ✅ Token generated (shows expiry time)
   - ✅ Download starts automatically
   - ✅ Token expires after 15 minutes

### **7.2 Test Access Controls**

1. **Without subscription:**
   - ✅ Can browse books
   - ❌ Cannot download books
   - ✅ Shown subscription prompts

2. **With subscription:**
   - ✅ Can download any book
   - ✅ Download tokens work
   - ✅ Access clearly indicated

3. **Admin access:**
   - ✅ Can access `/admin/*` pages
   - ✅ Can manage all content
   - ✅ Can view all orders

---

## 📊 **Step 8: Data & Content Setup**

### **8.1 Add Real Books**

1. **Go to `/admin/products/add`**
2. **Add book details:**
   - Title, Author, Description
   - Price, Category, Tags
   - Cover image URL
   - Download file URL (PDF)

3. **Test book display** on frontend

### **8.2 Configure Global Settings**

1. **Go to `/admin/settings`**
2. **Set currency** to IDR (Rupiah)
3. **Configure store information**
4. **Test currency display** throughout app

### **8.3 Set Up Email Templates**

1. **Go to `/admin/settings/email`**
2. **Test all email types:**
   - Order confirmation
   - Payment notification
   - Welcome emails

---

## 🚀 **Step 9: Production Deployment**

### **9.1 Build Test**
```bash
# Test production build
npm run build

# Expected: Successful build without errors
npm run start
```

### **9.2 Environment Variables for Production**

**For Vercel deployment:**
1. **Connect GitHub repository**
2. **Set environment variables** in Vercel dashboard
3. **Use production Supabase** credentials
4. **Update NEXT_PUBLIC_APP_URL** to your domain

### **9.3 Final Checklist**

- [ ] **Database setup** complete with all scripts
- [ ] **Environment variables** configured
- [ ] **Admin user** created and tested
- [ ] **Payment methods** configured
- [ ] **Email service** working
- [ ] **Subscription flow** tested end-to-end
- [ ] **Download security** verified
- [ ] **Mobile experience** optimized
- [ ] **Performance** acceptable (build under 5 mins)

---

## 🆘 **Troubleshooting Common Issues**

### **"Database connection failed"**
```bash
# Check Supabase credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify project is active in Supabase dashboard
# Check if RLS policies are blocking access
```

### **"403 Forbidden" errors**
```sql
-- Check if admin user exists
SELECT * FROM public.admin_users WHERE id = 'your-user-uuid';

-- If not, add admin user:
INSERT INTO public.admin_users (id) VALUES ('your-user-uuid');
```

### **Email not working**
```bash
# Test Brevo credentials
# Check SMTP settings in .env.local
# Verify email configuration in admin panel
```

### **Download tokens failing**
```env
# Check JWT secret is set
DOWNLOAD_JWT_SECRET=your-secret-key

# Verify expiry time
DOWNLOAD_TOKEN_EXPIRY_MINUTES=15
```

### **Mobile navigation missing**
```bash
# Check if MobileBottomNav component is imported
# Verify Tailwind CSS is working
# Check responsive classes are applied
```

---

## 🎉 **Success! Your Ebook Store is Ready**

If you've completed all steps successfully, you now have:

✅ **Fully functional ebook store**  
✅ **Subscription-based access system**  
✅ **Secure download with expired tokens**  
✅ **Complete admin management**  
✅ **Mobile-responsive design**  
✅ **Email notifications**  
✅ **Payment processing**  
✅ **WhatsApp integration**  

### **Next Steps:**
1. **Add your book content**
2. **Customize branding and design**
3. **Set up domain and SSL**
4. **Monitor analytics and usage**
5. **Scale and optimize as needed**

### **Support:**
- **GitHub Issues**: Report bugs or request features
- **Admin Dashboard**: Built-in help and documentation
- **Code Comments**: Inline documentation throughout

**Happy book selling! 📚✨**