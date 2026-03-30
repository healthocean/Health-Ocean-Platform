import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { Lab } from '../models/Lab';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { LabTest } from '../models/LabTest';
import { LabPackage } from '../models/LabPackage';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'health-ocean-secret-key';

// Middleware to verify admin token
const verifyAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findOne({ adminId: decoded.adminId, status: 'Active' });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to verify SuperAdmin
const verifySuperAdmin = async (req: any, res: any, next: any) => {
  if (req.admin.role !== 'SuperAdmin') {
    return res.status(403).json({ success: false, message: 'SuperAdmin access required' });
  }
  next();
};

// Admin Login Schema
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Admin Creation Schema
const adminCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['Admin']), // Only SuperAdmin can create, and only regular Admins
});

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const validatedData = adminLoginSchema.parse(req.body);
    
    const admin = await Admin.findOne({ email: validatedData.email, status: 'Active' });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const isPasswordValid = await bcrypt.compare(validatedData.password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const token = jwt.sign(
      { adminId: admin.adminId, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      admin: {
        id: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [
      totalLabs,
      pendingLabs,
      approvedLabs,
      totalUsers,
      totalBookings,
      totalTests,
      totalPackages,
    ] = await Promise.all([
      Lab.countDocuments(),
      Lab.countDocuments({ status: 'Pending' }),
      Lab.countDocuments({ status: 'Approved' }),
      User.countDocuments(),
      Booking.countDocuments(),
      LabTest.countDocuments(),
      LabPackage.countDocuments(),
    ]);

    // Calculate today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today },
    });

    // Calculate total revenue (sum of all booking amounts)
    const revenueResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalLabs,
        pendingLabs,
        approvedLabs,
        totalUsers,
        totalBookings,
        totalTests,
        totalPackages,
        todayBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/labs - Get all labs
router.get('/labs', verifyAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query: any = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { labId: { $regex: search, $options: 'i' } },
      ];
    }
    
    const labs = await Lab.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      labs,
      total: labs.length,
    });
  } catch (error) {
    console.error('Get labs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/labs/:labId - Get lab details
router.get('/labs/:labId', verifyAdmin, async (req, res) => {
  try {
    const { labId } = req.params;
    
    const lab = await Lab.findOne({ labId }).select('-password');
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found',
      });
    }
    
    // Get lab's tests and packages count
    const [testsCount, packagesCount] = await Promise.all([
      LabTest.countDocuments({ labId }),
      LabPackage.countDocuments({ labId }),
    ]);
    
    res.json({
      success: true,
      lab: {
        ...lab.toObject(),
        testsCount,
        packagesCount,
      },
    });
  } catch (error) {
    console.error('Get lab details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PATCH /api/admin/labs/:labId/status - Update lab status
router.patch('/labs/:labId/status', verifyAdmin, async (req, res) => {
  try {
    const { labId } = req.params;
    const { status } = req.body;
    
    if (!['Approved', 'Rejected', 'Suspended', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const lab = await Lab.findOneAndUpdate(
      { labId },
      { status },
      { new: true }
    ).select('-password');
    
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found',
      });
    }
    
    res.json({
      success: true,
      lab,
      message: `Lab ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Update lab status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/users/search - Search user by email or phone
router.get('/users/search', verifyAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required',
      });
    }
    
    const user = await User.findOne({
      $or: [
        { email: query },
        { phone: query },
      ],
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Get user's bookings
    const bookings = await Booking.find({ userEmail: user.email })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        bookingsCount: bookings.length,
        recentBookings: bookings,
      },
    });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/bookings - Get all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/admin/analytics - Detailed analytics and insights
router.get('/analytics', verifyAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // 1. Orders and Revenue Trend
    const trendData = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. City Performance
    const cityData = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$city', orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { orders: -1 } },
      { $limit: 10 },
    ]);

    // 3. Lab Performance
    const labData = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$labId', orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { orders: -1 } },
      { $limit: 10 },
    ]);
    const labIds = labData.map((l: any) => l._id).filter(Boolean);
    const labDocs = await Lab.find({ labId: { $in: labIds } }).select('labId name');
    const labMap: Record<string, string> = {};
    labDocs.forEach((l: any) => { labMap[l.labId] = l.name; });
    const labPerformance = labData.map((l: any) => ({
      name: labMap[l._id] || l._id || 'Unknown',
      orders: l.orders,
      revenue: l.revenue || 0,
    }));

    // 4. Test Popularity
    const testData = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: '$testIds' },
      { $group: { _id: '$testIds', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const testIds = testData.map((t: any) => t._id);
    const testDocs = await LabTest.find({ testId: { $in: testIds } }).select('testId name');
    const testMap: Record<string, string> = {};
    testDocs.forEach((t: any) => { testMap[t.testId] = t.name; });
    const testPopularity = testData.map((t: any) => ({
      name: testMap[t._id] || t._id || 'Unknown',
      count: t.count,
    }));

    // 5. Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 6. User retention
    const userStats = await Booking.aggregate([
      { $group: { _id: '$email', bookings: { $sum: 1 } } },
    ]);
    const totalOrderedUsers = userStats.length;
    const repeatUsers = userStats.filter((u: any) => u.bookings > 1).length;
    const retentionRate = totalOrderedUsers > 0 ? ((repeatUsers / totalOrderedUsers) * 100).toFixed(1) : '0';

    // 7. Summary totals for the period
    const periodSummary = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalOrders = periodSummary[0]?.totalOrders || 0;
    const totalRevenue = periodSummary[0]?.totalRevenue || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 8. Total active tests count
    const totalTests = await LabTest.countDocuments({ status: 'Active' });

    // 9. Funnel
    const totalUsers = await User.countDocuments();
    const funnel = [
      { step: 'Registered Users', count: totalUsers },
      { step: 'Users Booked', count: totalOrderedUsers },
      { step: 'Repeat Users', count: repeatUsers },
    ];

    res.json({
      success: true,
      data: {
        trend: trendData,
        cities: cityData.map((c: any) => ({ name: c._id || 'Unknown', orders: c.orders, revenue: c.revenue || 0 })),
        labs: labPerformance,
        tests: testPopularity,
        statusBreakdown: statusBreakdown.map((s: any) => ({ status: s._id, count: s.count })),
        retention: { totalUsers: totalOrderedUsers, repeatUsers, rate: retentionRate },
        summary: { totalOrders, totalRevenue, avgOrderValue },
        totalTests,
        funnel,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/health - Platform health monitoring
router.get('/health', verifyAdmin, async (req, res) => {
  const checks: any = { timestamp: new Date().toISOString(), services: [] };
  
  try {
    // 1. Database connectivity & performance
    const dbStart = Date.now();
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.db.admin().ping();
      const dbLatency = Date.now() - dbStart;
      checks.services.push({
        name: 'Database',
        status: dbLatency < 100 ? 'healthy' : dbLatency < 500 ? 'degraded' : 'slow',
        latency: dbLatency,
        details: `${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`,
      });
    } catch (e) {
      checks.services.push({ name: 'Database', status: 'down', error: 'Connection failed' });
    }

    // 2. API response time (self-check via simple query)
    const apiStart = Date.now();
    try {
      await Admin.findOne().limit(1);
      const apiLatency = Date.now() - apiStart;
      checks.services.push({
        name: 'API Server',
        status: apiLatency < 50 ? 'healthy' : apiLatency < 200 ? 'degraded' : 'slow',
        latency: apiLatency,
      });
    } catch (e) {
      checks.services.push({ name: 'API Server', status: 'error', error: 'Query failed' });
    }

    // 3. Data integrity checks
    const integrityStart = Date.now();
    try {
      const [labsWithoutLocation, bookingsWithoutLab, usersWithoutEmail] = await Promise.all([
        Lab.countDocuments({ $or: [{ location: null }, { 'location.coordinates': { $size: 0 } }] }),
        Booking.countDocuments({ labId: { $in: [null, ''] } }),
        User.countDocuments({ email: { $in: [null, ''] } }),
      ]);
      const totalIssues = labsWithoutLocation + bookingsWithoutLab + usersWithoutEmail;
      checks.services.push({
        name: 'Data Integrity',
        status: totalIssues === 0 ? 'healthy' : totalIssues < 10 ? 'warning' : 'critical',
        issues: totalIssues,
        details: `${labsWithoutLocation} labs missing location, ${bookingsWithoutLab} orphaned bookings, ${usersWithoutEmail} invalid users`,
        latency: Date.now() - integrityStart,
      });
    } catch (e) {
      checks.services.push({ name: 'Data Integrity', status: 'error', error: 'Check failed' });
    }

    // 4. Lab approval queue health
    const queueStart = Date.now();
    try {
      const pendingCount = await Lab.countDocuments({ status: 'Pending' });
      const oldestPending = await Lab.findOne({ status: 'Pending' }).sort({ createdAt: 1 });
      const daysPending = oldestPending
        ? Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      checks.services.push({
        name: 'Lab Approval Queue',
        status: pendingCount === 0 ? 'healthy' : pendingCount < 5 ? 'normal' : daysPending > 7 ? 'critical' : 'warning',
        pending: pendingCount,
        oldestDays: daysPending,
        latency: Date.now() - queueStart,
      });
    } catch (e) {
      checks.services.push({ name: 'Lab Approval Queue', status: 'error', error: 'Check failed' });
    }

    // 5. Booking system health
    const bookingStart = Date.now();
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentBookings = await Booking.countDocuments({ createdAt: { $gte: last24h } });
      const failedBookings = await Booking.countDocuments({
        createdAt: { $gte: last24h },
        status: { $in: ['Cancelled', 'Failed'] },
      });
      const failureRate = recentBookings > 0 ? (failedBookings / recentBookings) * 100 : 0;
      checks.services.push({
        name: 'Booking System',
        status: failureRate < 5 ? 'healthy' : failureRate < 15 ? 'degraded' : 'critical',
        last24h: recentBookings,
        failureRate: failureRate.toFixed(1) + '%',
        latency: Date.now() - bookingStart,
      });
    } catch (e) {
      checks.services.push({ name: 'Booking System', status: 'error', error: 'Check failed' });
    }

    // 6. User authentication health (recent login activity)
    const authStart = Date.now();
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [recentUsers, recentLabs] = await Promise.all([
        User.countDocuments({ lastLogin: { $gte: last24h } }),
        Lab.countDocuments({ lastLogin: { $gte: last24h } }),
      ]);
      const totalActiveUsers = recentUsers + recentLabs;
      checks.services.push({
        name: 'Authentication System',
        status: 'healthy',
        last24h: totalActiveUsers,
        details: `${recentUsers} users, ${recentLabs} labs logged in`,
        latency: Date.now() - authStart,
      });
    } catch (e) {
      checks.services.push({ name: 'Authentication System', status: 'error', error: 'Check failed' });
    }

    // Overall status
    const criticalCount = checks.services.filter((s: any) => s.status === 'critical' || s.status === 'down').length;
    const warningCount = checks.services.filter((s: any) => s.status === 'warning' || s.status === 'degraded' || s.status === 'slow').length;
    checks.overall = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'degraded' : 'healthy';

    res.json({ success: true, health: checks });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, message: 'Health check failed', error: String(error) });
  }
});

// ============ SUPERADMIN ONLY ROUTES ============

// GET /api/admin/admins - Get all admins (SuperAdmin only)
router.get('/admins', verifyAdmin, verifySuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      admins,
      total: admins.length,
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/admin/admins - Create new admin (SuperAdmin only)
router.post('/admins', verifyAdmin, verifySuperAdmin, async (req, res) => {
  try {
    const validatedData = adminCreateSchema.parse(req.body);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: validatedData.email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email',
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Generate admin ID
    const adminId = `ADMIN${Date.now()}`;
    
    // Create admin
    const admin = await Admin.create({
      ...validatedData,
      adminId,
      password: hashedPassword,
      createdBy: req.admin.adminId,
    });
    
    res.status(201).json({
      success: true,
      admin: {
        id: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
      message: 'Admin created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PATCH /api/admin/admins/:adminId/status - Update admin status (SuperAdmin only)
router.patch('/admins/:adminId/status', verifyAdmin, verifySuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    const { status } = req.body;
    
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    // Prevent SuperAdmin from deactivating themselves
    if (adminId === req.admin.adminId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status',
      });
    }
    
    const admin = await Admin.findOneAndUpdate(
      { adminId },
      { status },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }
    
    res.json({
      success: true,
      admin,
      message: `Admin ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /api/admin/admins/:adminId - Delete admin (SuperAdmin only)
router.delete('/admins/:adminId', verifyAdmin, verifySuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Prevent SuperAdmin from deleting themselves
    if (adminId === req.admin.adminId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }
    
    // Prevent deleting other SuperAdmins
    const adminToDelete = await Admin.findOne({ adminId });
    if (adminToDelete?.role === 'SuperAdmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete SuperAdmin accounts',
      });
    }
    
    const admin = await Admin.findOneAndDelete({ adminId });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
