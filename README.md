# 📚 Ebook Store - Complete Subscription-Based Ebook Platform

A modern, full-featured ebook store built with Next.js, Supabase, and TypeScript, featuring subscription-based access, secure downloads with expired tokens, and comprehensive admin management.

## 🎯 **Key Features**

### **🔐 Subscription System**
- **3 Subscription Plans**: 1-day, 30-day, and lifetime access
- **JWT-Based Download Security**: 15-minute expired download tokens
- **Anti-Offline Protection**: Prevents users from saving pages offline
- **Subscription Management**: Full CRUD operations for plans

### **📖 Ebook Management**
- **5000+ Ebook Support**: Optimized pagination and performance
- **Advanced Search & Filtering**: Find books easily
- **Category Management**: Organized book collections
- **Mobile-Responsive Design**: Perfect on all devices

### **🛒 E-Commerce Features**
- **Shopping Cart**: Individual book purchases
- **Guest Checkout**: With automatic account creation
- **Multiple Payment Methods**: Manual payment setup (Bank, OVO, Dana, etc.)
- **Order Management**: Complete order tracking system

### **👤 User Management**
- **Authentication**: Secure login/signup with Supabase Auth
- **User Profiles**: Name, WhatsApp, email management
- **Download History**: Track all user downloads
- **Subscription Status**: Clear subscription indicators

### **⚡ Performance & UX**
- **Universal Loading System**: Beautiful loading states
- **Mobile Bottom Navigation**: Easy navigation on mobile
- **Pagination & Caching**: Handle large book collections
- **Toast Notifications**: Instant user feedback
- **WhatsApp Integration**: Customer support integration

### **🛡️ Security & Analytics**
- **Row Level Security (RLS)**: Database-level security
- **Download Logging**: Track all download activities
- **Token Validation**: Secure download access
- **Admin Dashboard**: Complete admin management

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/Yusufkotavom/ebook.git
cd ebook
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Configuration  
DATABASE_URL=your_database_connection_string
DIRECT_URL=your_direct_database_url

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Ebook Store

# Email Configuration (Brevo)
BREVO_API_KEY=your_brevo_api_key
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Ebook Store
EMAIL_REPLY_TO=support@yourdomain.com

# Download Security
DOWNLOAD_JWT_SECRET=your-super-secret-jwt-key-for-download-tokens
DOWNLOAD_TOKEN_EXPIRY_MINUTES=15

# WhatsApp Integration
WHATSAPP_NUMBER=6285799520350
```

### **4. Database Setup**

#### **Option A: Complete New Setup**
Run SQL scripts in order:
```sql
-- In Supabase SQL Editor, run these in order:
-- 1. setup/sql/01_auth_and_profiles.sql
-- 2. setup/sql/02_products.sql  
-- 3. setup/sql/03_orders_and_items.sql
-- 4. setup/sql/04_payment_methods.sql
-- 5. setup/sql/05_notifications.sql
-- 6. setup/sql/06_app_settings.sql
-- 7. setup/sql/07_admin_users.sql
-- 8. setup/sql/08_row_level_security.sql
-- 9. setup/sql/09_indexes_and_performance.sql
-- 10. setup/sql/10_sample_data.sql
-- 11. scripts/013_subscription_packages.sql
-- 12. scripts/014_download_security.sql
```

#### **Option B: Verification**
Run verification script:
```sql
-- setup/verification.sql
-- This checks if all tables and functions are created correctly
```

### **5. Create First Admin User**
1. Sign up through the app
2. Get your user UUID from Supabase Auth dashboard
3. Run SQL:
```sql
INSERT INTO public.admin_users (id) VALUES ('your_user_uuid_here');
```

### **6. Start Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 **App Structure & Navigation**

### **Public Pages**
- **`/`** - Homepage with featured books
- **`/books`** - Complete book library with download functionality
- **`/subscriptions`** - Subscription plans and pricing
- **`/products`** - Individual book purchases (legacy)
- **`/auth/login`** - User authentication
- **`/auth/sign-up`** - User registration

### **User Dashboard** (`/dashboard/*`)
- **`/dashboard`** - Personal dashboard overview
- **`/dashboard/orders`** - Order history
- **`/dashboard/downloads`** - Download history
- **`/dashboard/profile`** - Profile management

### **Admin Panel** (`/admin/*`)
- **`/admin/dashboard`** - Admin overview
- **`/admin/products`** - Book management (CRUD)
- **`/admin/orders`** - Order management
- **`/admin/notifications`** - Notification system
- **`/admin/settings`** - Global settings
- **`/admin/settings/email`** - Email configuration
- **`/admin/settings/payment-methods`** - Payment setup

### **E-Commerce Flow**
- **`/checkout`** - Shopping cart and checkout
- **`/checkout/payment`** - Payment processing
- **`/order-confirmation`** - Order success page

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **React Hot Toast** - Notifications

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database with Row Level Security
- **Supabase Auth** - Authentication system
- **Supabase Storage** - File storage (optional)

### **Key Libraries**
- **jsonwebtoken** - JWT for download tokens
- **@getbrevo/brevo** - Email service
- **nprogress** - Loading progress bars
- **lucide-react** - Icons

### **State Management**
- **React Context** - Auth, Cart, Currency
- **useReducer** - Complex state logic
- **localStorage** - Client-side persistence

## 🔐 **Security Features**

### **Download Security**
```javascript
// Two-step secure download process
1. Generate Token: POST /api/books/generate-download-token
2. Download File: POST /api/books/download/{id} (with token)

// Token expires in 15 minutes
// Prevents offline page saving
// Tied to user, product, and subscription
```

### **Database Security**
- **Row Level Security (RLS)** on all tables
- **User isolation** - users only see their data
- **Admin permissions** - role-based access control
- **Subscription validation** at multiple levels

### **Authentication Flow**
- **Supabase Auth** with secure JWT tokens
- **Guest checkout** with automatic account creation
- **Password reset** and email verification
- **Session persistence** across browser refreshes

## 📊 **Subscription System Details**

### **Three Plans Available**

#### **🟢 1-Day Access - Rp 15.000**
- Perfect for quick reading sessions
- Access to all ebooks for 24 hours
- Unlimited downloads during period
- Mobile-friendly access

#### **🔵 30-Day Access - Rp 99.000** ⭐ **Most Popular**
- Great for regular readers
- Full month of unlimited access
- Priority customer service
- Perfect balance of value and time

#### **🟡 Lifetime Access - Rp 299.000** 🔥 **Best Value**
- One-time payment for permanent access
- Never expires - truly lifetime
- Early access to new books
- Maximum value for book lovers

### **Subscription Features**
- **Automatic Activation** after payment
- **Download Tracking** and analytics
- **Subscription Status** clearly displayed
- **Easy Upgrade/Downgrade** path

## 🛠️ **Development Workflow**

### **Branch Structure**
- **`master`** - Production ready code
- **`feature/*`** - Feature development branches
- **`feature/subscription-system`** - Current subscription work

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests (if configured)
```

### **Database Management**
```bash
# Run new migrations
npx supabase db reset  # Reset local database
npx supabase db push   # Push schema changes

# Generate TypeScript types
npx supabase gen types typescript --local > types/database.types.ts
```

## 📈 **Performance Optimizations**

### **Pagination System**
- **50 books per page** on homepage
- **Advanced pagination** with caching
- **Infinite scroll** option available
- **Search optimization** with debouncing

### **Caching Strategy**
- **Client-side caching** for product data
- **HTTP cache headers** for static assets
- **Database query optimization** with indexes
- **Image optimization** with Next.js Image

### **Mobile Performance**
- **Progressive loading** of content
- **Optimized images** with proper sizing
- **Minimal JavaScript** for faster load times
- **Service worker** ready for PWA conversion

## 🎨 **UI/UX Features**

### **Mobile-First Design**
- **Responsive grid layouts** for all screen sizes
- **Touch-friendly** buttons and navigation
- **Bottom navigation** for mobile users
- **Swipe gestures** where appropriate

### **Loading States**
- **Universal loading system** for page transitions
- **Skeleton screens** for better perceived performance
- **Progress indicators** for downloads
- **Loading spinners** with context-specific messages

### **User Feedback**
- **Toast notifications** for all actions
- **Form validation** with clear error messages
- **Success confirmations** for important actions
- **Loading states** to prevent double-clicks

## 🔧 **Admin Management**

### **Content Management**
- **Book CRUD** operations with rich forms
- **Bulk operations** for efficiency
- **Image upload** and management
- **Category and tag** management

### **User Management**
- **User overview** and statistics
- **Subscription management** and history
- **Download analytics** and reporting
- **Customer support** tools

### **System Settings**
- **Global currency** settings (IDR default)
- **Email configuration** (Brevo integration)
- **Payment method** setup and management
- **WhatsApp integration** configuration

## 📧 **Email & Notifications**

### **Transactional Emails**
- **Order confirmations** with download links
- **Payment notifications** with receipts
- **Welcome emails** for new users
- **Password reset** and verification

### **Email Service (Brevo)**
- **HTML templates** with branded design
- **Automatic sending** on order events
- **Delivery tracking** and analytics
- **Admin test email** functionality

### **WhatsApp Integration**
- **Support chat** with pre-filled messages
- **Order notifications** via WhatsApp
- **Dynamic message** generation
- **Contact integration** throughout app

## 🚀 **Deployment Guide**

### **Environment Preparation**
1. **Production Supabase** project setup
2. **Environment variables** configuration
3. **Database migration** run
4. **Admin user** creation

### **Deployment Options**

#### **Vercel (Recommended)**
```bash
# Connect to Vercel
npx vercel

# Set environment variables in Vercel dashboard
# Deploy automatically on push to main
```

#### **Docker Deployment**
```dockerfile
# Use provided Dockerfile
docker build -t ebook-store .
docker run -p 3000:3000 ebook-store
```

#### **Manual Server**
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### **Post-Deployment**
1. **Test subscription flow** end-to-end
2. **Verify email delivery** through Brevo
3. **Check download security** with expired tokens
4. **Monitor performance** and error logs

## 📋 **Testing Checklist**

### **Core Functionality**
- [ ] User registration and login
- [ ] Book browsing and search
- [ ] Subscription purchase flow
- [ ] Download with expired tokens
- [ ] Cart and checkout process
- [ ] Admin panel access and management

### **Security Testing**
- [ ] Download token expiration (15 minutes)
- [ ] Unauthorized access prevention
- [ ] RLS policy effectiveness
- [ ] Admin-only access controls

### **Mobile Testing**
- [ ] Responsive design on all screens
- [ ] Touch interactions work properly
- [ ] Bottom navigation functionality
- [ ] Performance on slower devices

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Database Connection Error**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify Supabase project is active
# Check RLS policies are not blocking queries
```

#### **Download Token Errors**
```javascript
// Check JWT secret configuration
DOWNLOAD_JWT_SECRET=your-secret-key

// Verify token expiry settings
DOWNLOAD_TOKEN_EXPIRY_MINUTES=15

// Check user subscription status
```

#### **Email Delivery Issues**
```bash
# Test Brevo API connection
# Check SMTP credentials
# Verify email templates in admin
```

### **Support & Documentation**
- **GitHub Issues**: Report bugs and feature requests
- **Admin Dashboard**: Built-in documentation and help
- **Code Comments**: Inline documentation throughout codebase

## 🔄 **Roadmap & Future Features**

### **Planned Features**
- [ ] **PWA Support** - Offline reading capability
- [ ] **Book Reviews** - User rating and review system
- [ ] **Wishlist** - Save books for later
- [ ] **Recommendation Engine** - AI-powered book suggestions
- [ ] **Multi-language** - Internationalization support
- [ ] **Dark Mode** - User preference themes
- [ ] **Advanced Analytics** - Detailed usage statistics
- [ ] **API Documentation** - Public API for integrations

### **Performance Improvements**
- [ ] **CDN Integration** - Faster global content delivery
- [ ] **Database Optimization** - Query performance improvements
- [ ] **Caching Strategy** - Redis integration
- [ ] **Image Optimization** - WebP and AVIF support

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### **Code Style**
- **TypeScript** for all new code
- **ESLint + Prettier** for formatting
- **Conventional Commits** for git messages
- **Component documentation** for complex components

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Next.js Team** - Amazing React framework
- **Supabase** - Incredible backend platform
- **Shadcn** - Beautiful component library
- **Tailwind CSS** - Fantastic utility framework
- **React Community** - Endless inspiration and support

---

**Built with ❤️ for the love of books and learning**

For questions, support, or contributions, please open an issue or contact the development team.