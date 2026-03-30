import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import testRoutes from './routes/tests';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';
import labRoutes from './routes/labs';
import adminRoutes from './routes/admin';
import packageRoutes from './routes/packages';
import searchRoutes from './routes/search';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDatabase();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:4000',
  'http://10.49.253.207:3000',
  'http://10.49.253.207:3001',
  'http://10.49.253.207:3002',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/admin', adminRoutes);

// Health check with detailed metrics
app.get('/health', async (req, res) => {
  const startTime = Date.now();
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  try {
    // Check database connectivity
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    health.services.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStatus,
      responseTime: 0,
    };

    // Test database query performance
    if (dbState === 1) {
      const dbStart = Date.now();
      try {
        await mongoose.connection.db.admin().ping();
        health.services.database.responseTime = Date.now() - dbStart;
      } catch (e) {
        health.services.database.status = 'unhealthy';
        health.services.database.error = 'Ping failed';
      }
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
    };

    // Overall health
    const allHealthy = Object.values(health.services).every((s: any) => s.status === 'healthy');
    health.status = allHealthy ? 'healthy' : 'degraded';
    health.responseTime = Date.now() - startTime;

    res.status(allHealthy ? 200 : 503).json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = 'Health check failed';
    res.status(503).json(health);
  }
});

app.listen(PORT, () => {
  console.log(`🌊 Health Ocean API running on port ${PORT}`);
});
