import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Lab } from '../models/Lab';
import { LabEmployee } from '../models/LabEmployee';
import { LabTest } from '../models/LabTest';
import { LabPackage } from '../models/LabPackage';
import { Booking } from '../models/Booking';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'health-ocean-secret-key';

// Lab Registration Schema
const labRegisterSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  address: z.string().min(10),
  city: z.string(),
  state: z.string(),
  pincode: z.string().length(6),
  nablCertificate: z.string(),
  isoCertificate: z.string().optional(),
  licenseNumber: z.string(),
  establishedYear: z.number().min(1900).max(new Date().getFullYear()),
  description: z.string().optional(),
  servicesOffered: z.array(z.string()).optional(),
});

// Lab Update Schema
const labUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(10).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().length(6).optional(),
  description: z.string().optional(),
});

// Lab Login Schema
const labLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Employee Registration Schema
const employeeRegisterSchema = z.object({
  labId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Manager', 'Technician', 'Receptionist']),
});

// Employee Login Schema
const employeeLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Test Creation Schema
const testCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  category: z.string(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  sampleType: z.string(),
  turnaroundTime: z.string(),
  preparationRequired: z.boolean().optional(),
  preparationInstructions: z.string().optional(),
  parameters: z.array(z.string()).optional(),
});

// Package Creation Schema
const packageCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  category: z.string(),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  testsIncluded: z.array(z.string()),
  features: z.array(z.string()),
});

// POST /api/labs/register - Register a new lab
router.post('/register', async (req, res) => {
  try {
    const validatedData = labRegisterSchema.parse(req.body);
    
    // Check if lab already exists
    const existingLab = await Lab.findOne({ 
      $or: [
        { email: validatedData.email },
        { licenseNumber: validatedData.licenseNumber }
      ]
    });
    
    if (existingLab) {
      return res.status(400).json({
        success: false,
        message: 'Lab already exists with this email or license number',
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Generate lab ID
    const labId = `LAB${Date.now()}`;
    
    // Create lab
    const lab = await Lab.create({
      ...validatedData,
      labId,
      password: hashedPassword,
      status: 'Pending',
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { labId: lab.labId, email: lab.email, type: 'lab' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      lab: {
        labId: lab.labId,
        name: lab.name,
        email: lab.email,
        status: lab.status,
      },
      token,
      message: 'Lab registered successfully. Awaiting approval.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Lab registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/labs/login - Lab login
router.post('/login', async (req, res) => {
  try {
    const validatedData = labLoginSchema.parse(req.body);
    
    const lab = await Lab.findOne({ email: validatedData.email });
    if (!lab) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const isPasswordValid = await bcrypt.compare(validatedData.password, lab.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const token = jwt.sign(
      { labId: lab.labId, email: lab.email, type: 'lab' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      lab: {
        labId: lab.labId,
        name: lab.name,
        email: lab.email,
        status: lab.status,
        city: lab.city,
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
    console.error('Lab login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/labs/employees/register - Register lab employee
router.post('/employees/register', async (req, res) => {
  try {
    const validatedData = employeeRegisterSchema.parse(req.body);
    
    // Verify lab exists
    const lab = await Lab.findOne({ labId: validatedData.labId });
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found',
      });
    }
    
    // Check if employee already exists
    const existingEmployee = await LabEmployee.findOne({ email: validatedData.email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee already exists with this email',
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Generate employee ID
    const employeeId = `EMP${Date.now()}`;
    
    // Create employee
    const employee = await LabEmployee.create({
      ...validatedData,
      employeeId,
      password: hashedPassword,
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { employeeId: employee.employeeId, labId: employee.labId, email: employee.email, type: 'employee' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        labId: employee.labId,
      },
      token,
      message: 'Employee registered successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Employee registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/labs/:labId/employees - Get all employees for a lab
router.get('/:labId/employees', async (req, res) => {
  try {
    const { labId } = req.params;
    const employees = await LabEmployee.find({ labId }).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      employees,
      total: employees.length,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/labs/employees/login - Employee login
router.post('/employees/login', async (req, res) => {
  try {
    const validatedData = employeeLoginSchema.parse(req.body);
    
    const employee = await LabEmployee.findOne({ email: validatedData.email });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const isPasswordValid = await bcrypt.compare(validatedData.password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const token = jwt.sign(
      { employeeId: employee.employeeId, labId: employee.labId, email: employee.email, type: 'employee' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        labId: employee.labId,
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
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/labs/:labId/tests - Create a test
router.post('/:labId/tests', async (req, res) => {
  try {
    const { labId } = req.params;
    const validatedData = testCreateSchema.parse(req.body);
    
    // Verify lab exists
    const lab = await Lab.findOne({ labId });
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found',
      });
    }
    
    // Generate test ID
    const testId = `TEST${Date.now()}`;
    
    // Create test
    const test = await LabTest.create({
      ...validatedData,
      labId,
      testId,
    });
    
    res.status(201).json({
      success: true,
      test,
      message: 'Test created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Test creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/labs/:labId/tests - Get all tests for a lab
router.get('/:labId/tests', async (req, res) => {
  try {
    const { labId } = req.params;
    const tests = await LabTest.find({ labId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      tests,
      total: tests.length,
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /api/labs/:labId/packages - Create a package
router.post('/:labId/packages', async (req, res) => {
  try {
    const { labId } = req.params;
    const validatedData = packageCreateSchema.parse(req.body);
    
    // Verify lab exists
    const lab = await Lab.findOne({ labId });
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found',
      });
    }
    
    // Generate package ID
    const packageId = `PKG${Date.now()}`;
    
    // Create package
    const pkg = await LabPackage.create({
      ...validatedData,
      labId,
      packageId,
    });
    
    res.status(201).json({
      success: true,
      package: pkg,
      message: 'Package created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Package creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/labs/:labId/packages - Get all packages for a lab
router.get('/:labId/packages', async (req, res) => {
  try {
    const { labId } = req.params;
    const packages = await LabPackage.find({ labId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      packages,
      total: packages.length,
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PATCH /api/labs/tests/:testId - Update test status
router.patch('/tests/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const { status } = req.body;

    const test = await LabTest.findByIdAndUpdate(
      testId,
      { status },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.json({
      success: true,
      test,
      message: 'Test updated successfully',
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /api/labs/tests/:testId - Delete test
router.delete('/tests/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await LabTest.findByIdAndDelete(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PATCH /api/labs/packages/:packageId - Update package status
router.patch('/packages/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const { status } = req.body;

    const pkg = await LabPackage.findByIdAndUpdate(
      packageId,
      { status },
      { new: true }
    );

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.json({
      success: true,
      package: pkg,
      message: 'Package updated successfully',
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /api/labs/packages/:packageId - Delete package
router.delete('/packages/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;

    const pkg = await LabPackage.findByIdAndDelete(packageId);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/labs/:labId/stats - Get lab statistics
router.get('/:labId/stats', async (req, res) => {
  try {
    const { labId } = req.params;

    const [tests, packages] = await Promise.all([
      LabTest.find({ labId }),
      LabPackage.find({ labId }),
    ]);

    // Match on both custom testId AND MongoDB _id (mobile sends _id)
    const testIds = tests.flatMap(t => [t.testId, t._id.toString()]);
    const packageIds = packages.flatMap(p => [p.packageId, p._id.toString()]);

    // Find bookings that contain any of this lab's tests or packages
    const bookings = await Booking.find({
      $or: [
        { testIds: { $in: testIds } },
        { packageIds: { $in: packageIds } },
        { labId },
      ],
    }).sort({ createdAt: -1 });

    const totalTests = tests.length;
    const totalPackages = packages.length;
    const activeTests = tests.filter(t => t.status === 'Active').length;
    const activePackages = packages.filter(p => p.status === 'Active').length;

    // Sales maps
    const testSalesMap = new Map<string, number>();
    const packageSalesMap = new Map<string, number>();
    bookings.forEach(booking => {
      booking.testIds?.forEach(id => testSalesMap.set(id, (testSalesMap.get(id) || 0) + 1));
      booking.packageIds?.forEach(id => packageSalesMap.set(id, (packageSalesMap.get(id) || 0) + 1));
    });

    const topTests = tests
      .map(t => ({ testId: t.testId, name: t.name, category: t.category, price: t.price, sales: testSalesMap.get(t.testId) || 0 }))
      .sort((a, b) => b.sales - a.sales).slice(0, 5);

    const topPackages = packages
      .map(p => ({ packageId: p.packageId, name: p.name, category: p.category, price: p.price, sales: packageSalesMap.get(p.packageId) || 0 }))
      .sort((a, b) => b.sales - a.sales).slice(0, 5);

    // Monthly revenue — last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueMap = new Map<string, number>();
    bookings.forEach(booking => {
      const amount = booking.totalAmount ?? booking.total ?? 0;
      if (amount && booking.createdAt) {
        const key = months[booking.createdAt.getMonth()];
        monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) || 0) + amount);
      }
    });

    const currentMonth = new Date().getMonth();
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const idx = (currentMonth - (5 - i) + 12) % 12;
      const month = months[idx];
      return { month, revenue: monthlyRevenueMap.get(month) || 0 };
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount ?? b.total ?? 0), 0);

    res.json({
      success: true,
      stats: { totalTests, totalPackages, activeTests, activePackages, totalBookings, totalRevenue, topTests, topPackages, monthlyRevenue },
    });
  } catch (error) {
    console.error('Get lab stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/labs/:labId/bookings - Get bookings for a lab
router.get('/:labId/bookings', async (req, res) => {
  try {
    const { labId } = req.params;

    const [tests, packages] = await Promise.all([
      LabTest.find({ labId }, 'testId name price'),
      LabPackage.find({ labId }, 'packageId name price'),
    ]);

    // Match on both custom id AND MongoDB _id
    const testIds = tests.flatMap(t => [t.testId, t._id.toString()]);
    const packageIds = packages.flatMap(p => [p.packageId, p._id.toString()]);

    // Map both formats to name
    const testMap = new Map<string, string>();
    tests.forEach(t => { testMap.set(t.testId, t.name); testMap.set(t._id.toString(), t.name); });
    const packageMap = new Map<string, string>();
    packages.forEach(p => { packageMap.set(p.packageId, p.name); packageMap.set(p._id.toString(), p.name); });

    const bookings = await Booking.find({
      $or: [
        { testIds: { $in: testIds } },
        { packageIds: { $in: packageIds } },
        { labId },
      ],
    }).sort({ createdAt: -1 });

    const enriched = bookings.map(b => ({
      bookingId: b.bookingId,
      name: b.name,
      email: b.email,
      phone: b.phone,
      address: b.address,
      city: b.city,
      pincode: b.pincode,
      date: b.date,
      timeSlot: b.timeSlot,
      status: b.status,
      total: b.totalAmount ?? b.total ?? 0,
      createdAt: b.createdAt,
      reportUrl: b.reportUrl,
      tests: (b.testIds || []).filter(id => testMap.has(id)).map(id => testMap.get(id)),
      packages: (b.packageIds || []).filter(id => packageMap.has(id)).map(id => packageMap.get(id)),
    }));

    res.json({ success: true, bookings: enriched, total: enriched.length });
  } catch (error) {
    console.error('Get lab bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/labs/bookings/:bookingId/assign - Assign a phlebotomist to a booking
router.patch('/bookings/:bookingId/assign', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { employeeId } = req.body;

    // Verify employee exists
    const employee = await LabEmployee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const booking = await Booking.findOneAndUpdate(
      { $or: [{ bookingId }, { _id: bookingId.length === 24 ? bookingId : null }] },
      { 
        phlebotomistAssigned: true, 
        assignedTo: employeeId,
        status: 'In Progress' // Automatically mark as In Progress when assigned
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      booking, 
      message: `Booking assigned to ${employee.name}` 
    });
  } catch (error) {
    console.error('Assign booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/labs/employees/:employeeId/bookings - Get bookings assigned to a technician
router.get('/employees/:employeeId/bookings', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await LabEmployee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // Find bookings SPECIFICALLY assigned to this employee
    const bookings = await Booking.find({ 
      assignedTo: employeeId,
      status: { $in: ['Confirmed', 'In Progress'] }
    }).sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get employee bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/labs/bookings/:bookingId/status - Update booking status (for phlebotomist app)
router.patch('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findOneAndUpdate(
      { $or: [{ bookingId }, { _id: bookingId.length === 24 ? bookingId : null }] },
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, booking, message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/labs/bookings/:bookingId/report - Upload a report for a booking
router.post('/bookings/:bookingId/report', upload.single('report'), async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const reportUrl = `/uploads/reports/${req.file.filename}`;
    
    // Accept either Custom bookingId or MongoDB _id
    const booking = await Booking.findOneAndUpdate(
      { $or: [{ bookingId }, { _id: bookingId.length === 24 ? bookingId : null }] },
      { reportUrl, status: 'Completed' }, // we can mark it Completed on report upload
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Report uploaded successfully',
      reportUrl: booking.reportUrl
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/labs/employees/:employeeId/bookings - Get bookings assigned to a technician
router.get('/employees/:employeeId/bookings', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await LabEmployee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const bookings = await Booking.find({ 
      labId: employee.labId,
      status: { $in: ['Confirmed', 'In Progress', 'On My Way', 'Arrived', 'Sample Collected'] }
    }).sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get employee bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/labs/bookings/:bookingId/status - Update booking status (for phlebotomist app)
router.patch('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findOneAndUpdate(
      { $or: [{ bookingId }, { _id: bookingId.length === 24 ? bookingId : null }] },
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, booking, message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/labs/:labId - Get lab details
router.get('/:labId', async (req, res) => {
  try {
    const { labId } = req.params;
    const lab = await Lab.findOne({ labId }).select('-password');
    
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found',
      });
    }
    
    res.json({
      success: true,
      lab,
    });
  } catch (error) {
    console.error('Get lab error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PUT /api/labs/:labId - Update lab details
router.put('/:labId', async (req, res) => {
  try {
    const { labId } = req.params;
    const validatedData = labUpdateSchema.parse(req.body);
    
    const lab = await Lab.findOneAndUpdate(
      { labId },
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }
    
    res.json({ success: true, lab, message: 'Lab profile updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.errors });
    console.error('Update lab error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
