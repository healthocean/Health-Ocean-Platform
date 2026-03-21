# Health Ocean 🌊

**Tagline:** Dive into Better Health

Health Ocean is a lab test booking platform inspired by PharmEasy, offering convenient home sample collection and online report delivery across India's top 20 cities.

## 🚀 Features

- **Home Sample Collection**: Book tests and get samples collected at home
- **500+ Lab Tests**: Comprehensive test catalog with transparent pricing
- **NABL Certified Labs**: All tests processed by certified laboratories
- **Digital Reports**: Secure online access to reports
- **Health Packages**: Bundled tests at discounted prices
- **Easy Booking**: Multiple ways to book - online, call, or WhatsApp

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Zod** - Input validation
- **bcryptjs** - Password hashing

## 📦 Project Structure

```text
health-ocean/
├── apps/
│   ├── web/              # Patient web application (Next.js) - Port 3000
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   └── public/       # Static assets (logo, images)
│   ├── lab-portal/       # Laboratory portal (Next.js) - Port 3001 🏥
│   │   ├── app/          # Lab management pages
│   │   ├── components/   # Lab-specific components
│   │   └── lib/          # Lab authentication utilities
│   ├── admin-portal/     # Admin portal (Next.js) - Port 3002 🛡️
│   │   ├── app/          # Admin dashboard pages
│   │   ├── components/   # Admin-specific components
│   │   └── lib/          # Admin authentication utilities
│   └── api/              # Backend API (Express + TypeScript) - Port 4000
│       ├── src/
│       │   ├── routes/   # API routes
│       │   ├── models/   # Database models
│       │   └── index.ts  # Server entry point
│       └── package.json
├── mobile-apps/          # Flutter Mobile Applications 📱
│   ├── user-app/         # iOS/Android application for Patients
│   └── phlebotomist-app/ # iOS/Android operations app for Sample Collectors
├── packages/
│   ├── config/           # Shared configuration
│   └── types/            # Shared TypeScript types
├── START_ALL.sh          # Start all components locally
├── START_WEB.sh          # Start customer website
├── START_USER_APP.sh     # Run patient mobile flutter app
├── START_PHLEBOTOMIST_APP.sh # Run phlebotomist flutter app
├── START_LAB_PORTAL.sh   # Start lab portal
├── START_ADMIN_PORTAL.sh # Start admin portal
├── START_API.sh          # Start API server
└── README.md
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v20 or higher)
2. **MongoDB** - See [SETUP_MONGODB.md](SETUP_MONGODB.md) for installation guide

### Quick Start (Recommended)

Use the provided startup scripts:

```bash
# 1. Start MongoDB (if not already running)
sudo systemctl start mongod
# Or with Docker: docker start health-ocean-mongo

# 2. Start API Server (Backend)
./START_API.sh
# Runs on http://localhost:4000

# 3. Start Web App (Customer Site)
./START_WEB.sh
# Runs on http://localhost:3000

# 4. Start Lab Portal (Optional - for laboratories)
./START_LAB_PORTAL.sh
# Runs on http://localhost:3001

# 5. Start Admin Portal (Optional - for administrators)
./START_ADMIN_PORTAL.sh
# Runs on http://localhost:3002

# 6. Create SuperAdmin (First time only)
cd apps/api
npm run create-superadmin
# Email: superadmin@healthocean.com
# Password: superadmin123
```

### Access Points

- **Customer Website:** http://localhost:3000
- **Lab Portal:** http://localhost:3001
- **Admin Portal:** http://localhost:3002 🛡️
- **API Server:** http://localhost:4000

### Manual Start

**Frontend (Customer Site):**
```bash
cd apps/web
npm install  # First time only
npm run dev
```

**Mobile App (Customer App):**
```bash
cd mobile-apps/user-app
flutter pub get
flutter run
```

**Mobile App (Phlebotomist App):**
```bash
cd mobile-apps/phlebotomist-app
flutter pub get
flutter run
```

**Lab Portal:**
```bash
cd apps/lab-portal
npm install  # First time only
npm run dev
```

**Admin Portal:**
```bash
cd apps/admin-portal
npm install  # First time only
npm run dev
```

**Backend:**
```bash
cd apps/api
npm install  # First time only
cp .env.example .env  # First time only
npm run dev
```

## 🎨 Design

The UI is inspired by PharmEasy with:
- Clean, modern interface
- Ocean-themed colors
- Responsive design
- Easy navigation
- Quick action buttons

### Pages Included:
- ✅ Landing page with search
- ✅ Tests catalog with filtering
- ✅ Booking flow (3-step)
- ✅ User authentication (Login/Signup)
- ✅ About page
- ✅ Contact page
- ✅ Health concerns browser
- ✅ Vital organs checkups
- ✅ Recommended packages
- ✅ Trust indicators

### Backend API:
- ✅ RESTful API with Express.js
- ✅ Tests management endpoints
- ✅ Booking creation and management
- ✅ User authentication with JWT
- ✅ Input validation with Zod

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linting
```

## 🎯 Features Implemented

### Customer Website (Port 3000) & Mobile User App 📱
- [x] Responsive landing page with logo
- [x] Interactive search functionality
- [x] Test catalog with filters
- [x] **Shopping cart system** 🛒
- [x] **Cart page with order summary**
- [x] **Health packages page (8 packages)**
- [x] 3-step booking flow with coupon support
- [x] User authentication (Login/Signup)
- [x] **User dashboard with bookings**
- [x] Health concern categories
- [x] Vital organ checkups
- [x] Easy booking options
- [x] Recommended checkups by age/gender
- [x] Trust indicators
- [x] **Enhanced about page**
- [x] Contact page with form
- [x] Interactive body map testing interface (Flutter app)
- [x] Location tracking & mapping (Flutter app)

### Phlebotomist Operator App 🛵
- [x] Collector dashboard for task management
- [x] Assigned route management
- [x] Quick booking status updates
- [x] Google Maps integration for patient lookup

### Lab Portal (Port 3001) 🏥
- [x] Lab registration with certifications
- [x] Lab authentication and login
- [x] Lab dashboard with statistics
- [x] Test management (add, view, edit, delete)
- [x] Package management (create with multiple tests)
- [x] Employee registration with Lab ID
- [x] Role-based access (Admin/Manager/Technician/Receptionist)
- [x] Lab status tracking (Pending/Approved/Rejected)

### Admin Portal (Port 3002) 🛡️
- [x] Admin authentication with JWT
- [x] Two admin roles: SuperAdmin and Admin
- [x] Dashboard with real-time statistics from database
- [x] Lab verification system (approve/reject/suspend)
- [x] Lab search and filtering by status
- [x] Detailed lab information view
- [x] User search by email or phone
- [x] View user booking history
- [x] Admin management (SuperAdmin only)
- [x] Create/delete admins (SuperAdmin only)
- [x] Activate/deactivate admins (SuperAdmin only)
- [x] Analytics dashboard
- [x] Role-based access control
- [x] Secure admin-only access
- [x] Real data from MongoDB (no hardcoded data)

### Backend API (Port 4000)
- [x] RESTful API with Express.js
- [x] MongoDB database integration
- [x] Mongoose ODM
- [x] Tests CRUD operations
- [x] Booking management with coupon support
- [x] User registration and login
- [x] **Lab registration and authentication**
- [x] **Lab test and package management**
- [x] **Employee management**
- [x] JWT authentication
- [x] Password hashing with bcrypt
- [x] Input validation with Zod
- [x] CORS enabled

## 🚧 Coming Soon

- [ ] Assign bookings to labs
- [ ] Report upload and viewing
- [ ] Real-time order tracking
- [ ] Phlebotomist dispatch system
- [ ] Payment integration
- [ ] Email/SMS notifications
- [ ] Lab ratings and reviews
- [ ] Advanced analytics with charts

## 📚 Documentation

### Lab System
- **[LAB_SYSTEM_GUIDE.md](LAB_SYSTEM_GUIDE.md)** - Complete lab system documentation
- **[LAB_PORTAL_SETUP.md](LAB_PORTAL_SETUP.md)** - Lab portal setup and deployment guide
- **[TEST_LAB_SYSTEM.md](TEST_LAB_SYSTEM.md)** - Lab system testing guide
- **[LAB_QUICK_REFERENCE.md](LAB_QUICK_REFERENCE.md)** - Quick reference for lab features

### Admin System 🛡️
- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** - Admin system setup guide
- **[ADMIN_PORTAL_GUIDE.md](ADMIN_PORTAL_GUIDE.md)** - Complete admin portal documentation
- **[ADMIN_PORTAL_TESTING.md](ADMIN_PORTAL_TESTING.md)** - Detailed testing guide
- **[ADMIN_QUICK_REFERENCE.md](ADMIN_QUICK_REFERENCE.md)** - Quick reference for admin features

### Database
- **[SETUP_MONGODB.md](SETUP_MONGODB.md)** - MongoDB installation guide
- **[MONGODB_INTEGRATION.md](MONGODB_INTEGRATION.md)** - Database integration details

## 📄 License

MIT License

---

Made with ❤️ for Health Ocean