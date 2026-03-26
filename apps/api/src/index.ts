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
app.use(cors());
app.use(express.json());

// Serve uploaded reports statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌊 Health Ocean API running on port ${PORT}`);
});
