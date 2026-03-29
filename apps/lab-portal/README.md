# Health Ocean Lab Portal

Laboratory management portal for Health Ocean diagnostic centers.

## Features

- Lab registration and authentication
- Test management (add, view, edit, delete)
- Package management (create packages with multiple tests)
- Employee management (register staff with Lab ID)
- Dashboard with statistics and overview

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
# Run development server (port 3001)
npm run dev
```

The lab portal will be available at `http://localhost:3001`

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Routes

- `/` - Home page
- `/register` - Lab registration
- `/login` - Lab login
- `/dashboard` - Lab dashboard (protected)
- `/tests/add` - Add new test (protected)
- `/packages/add` - Add new package (protected)
- `/employees/register` - Employee registration

## Environment

The lab portal runs on port 3001 by default to avoid conflicts with the main web app (port 3000).

## API Integration

The portal connects to the Health Ocean API at `http://https://ada5-2401-4900-7083-fd76-b652-92d9-1ad3-fb9c.ngrok-free.app/api/labs/*`

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
