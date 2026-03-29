# Health Ocean API

Backend API for Health Ocean lab test booking platform.

## Features

- RESTful API with Express.js
- TypeScript for type safety
- JWT authentication
- Input validation with Zod
- CORS enabled

## API Endpoints

### Tests
- `GET /api/tests` - Get all tests (with optional search and category filters)
- `GET /api/tests/:id` - Get single test by ID
- `GET /api/tests/meta/categories` - Get all test categories

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings` - Get all bookings (with optional email filter)
- `PATCH /api/bookings/:id/cancel` - Cancel a booking

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires authentication)

### Health Check
- `GET /health` - API health check

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The API will run on http://https://ada5-2401-4900-7083-fd76-b652-92d9-1ad3-fb9c.ngrok-free.app

## Environment Variables

- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Note

This is a minimal implementation using in-memory storage. In production, you should:
- Use a proper database (PostgreSQL, MongoDB, etc.)
- Add proper authentication middleware
- Implement rate limiting
- Add request logging
- Set up proper error handling
- Add data persistence
- Implement proper security measures
