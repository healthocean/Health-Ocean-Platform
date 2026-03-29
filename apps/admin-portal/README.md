# Health Ocean Admin Portal

Administrative dashboard for Health Ocean platform management.

## Features

- **Dashboard** - Overview with key metrics and statistics
- **Lab Verification** - Review and approve laboratory registrations
- **User Management** - View and manage platform users
- **Analytics** - Platform insights and performance metrics
- **Secure Authentication** - Role-based admin access

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API server running on `http://https://ada5-2401-4900-7083-fd76-b652-92d9-1ad3-fb9c.ngrok-free.app`
- MongoDB running

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run development server (port 3002)
npm run dev
```

The admin portal will be available at `http://localhost:3002`

### Demo Login

```
Email: admin@healthocean.com
Password: admin123
```

## Routes

- `/` - Home page
- `/login` - Admin login
- `/dashboard` - Admin dashboard (protected)
- `/labs` - Lab verification (protected)
- `/users` - User management (protected)
- `/analytics` - Analytics & reports (protected)

## Environment

The admin portal runs on port 3002 by default:
- **Main Website:** http://localhost:3000
- **Lab Portal:** http://localhost:3001
- **Admin Portal:** http://localhost:3002 ⭐
- **API Server:** http://https://ada5-2401-4900-7083-fd76-b652-92d9-1ad3-fb9c.ngrok-free.app

## Key Features

### Lab Verification
- View all registered laboratories
- Filter by status (Pending/Approved/Rejected)
- Search by name, email, city, or Lab ID
- View detailed lab information
- Approve or reject lab registrations
- Real-time status updates

### Dashboard
- Total labs, users, bookings statistics
- Pending lab approvals count
- Revenue tracking
- Recent activity feed
- Platform health status

### Analytics
- Revenue growth trends
- User growth metrics
- Booking statistics
- Performance insights

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

## Subdomain Setup

For production, this app should be deployed as a subdomain:
- Main site: `healthocean.com`
- Lab portal: `lab.healthocean.com`
- Admin portal: `admin.healthocean.com` ⭐

## Security

- Secure authentication required
- Role-based access control
- Protected routes
- Session management
- Admin-only access

## API Integration

The portal connects to these API endpoints:
- `GET /api/admin/labs` - Get all labs
- `PATCH /api/admin/labs/:labId/status` - Update lab status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data

## Development Notes

- Currently uses demo authentication
- Replace with actual API calls in production
- Add proper admin user management
- Implement real-time notifications
- Add audit logging
