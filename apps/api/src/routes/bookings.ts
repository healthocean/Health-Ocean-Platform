import { Router } from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import { LabTest } from '../models/LabTest';
import { LabPackage } from '../models/LabPackage';

const router = Router();

// Validation schema
const bookingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(10),
  city: z.string(),
  pincode: z.string().length(6),
  date: z.string(),
  timeSlot: z.string(),
  testIds: z.array(z.string()).optional(),
  packageIds: z.array(z.string()).optional(),
  couponCode: z.string().nullable().optional(),
  discount: z.number().optional(),
  total: z.number().optional(),
  totalAmount: z.number().optional(),
  userLocation: z.object({
    type: z.string().optional(),
    coordinates: z.array(z.number()),
  }).optional(),
});

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const validatedData = bookingSchema.parse(req.body);

    // Resolve labId from the first packageId or testId (supports both _id and custom testId)
    let labId: string | undefined;

    if (validatedData.packageIds && validatedData.packageIds.length > 0) {
      const firstId = validatedData.packageIds[0];
      const pkg = await LabPackage.findOne({
        $or: [
          { packageId: firstId },
          ...(firstId.match(/^[a-f\d]{24}$/i) ? [{ _id: firstId }] : [])
        ]
      });
      if (pkg) labId = pkg.labId;
    }

    if (!labId && validatedData.testIds && validatedData.testIds.length > 0) {
      const firstId = validatedData.testIds[0];
      const test = await LabTest.findOne({
        $or: [
          { testId: firstId },
          ...(firstId.match(/^[a-f\d]{24}$/i) ? [{ _id: firstId }] : [])
        ],
      });
      if (test) labId = test.labId;
    }

    if (!labId && validatedData.testIds && validatedData.testIds.length > 0) {
      // fallback: try all ids
      for (const id of validatedData.testIds) {
        const test = await LabTest.findOne({ $or: [{ testId: id }, ...(id.match(/^[a-f\d]{24}$/i) ? [{ _id: id }] : [])] });
        if (test) { labId = test.labId; break; }
      }
    }

    const booking = await Booking.create({
      bookingId: `BK${Date.now()}`,
      ...validatedData,
      ...(labId ? { labId } : {}),
      status: 'Confirmed',
      phlebotomistAssigned: false,
    });

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/bookings - Get all bookings (with optional user filter)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    
    const filter = email ? { email } : {};
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    
    // Enrich with test and package names
    const testIds = [...new Set(bookings.flatMap(b => b.testIds || []))];
    const packageIds = [...new Set(bookings.flatMap(b => b.packageIds || []))];

    let tests: any[] = [];
    let packages: any[] = [];

    if (testIds.length > 0) {
      tests = await LabTest.find({
        $or: [
          { testId: { $in: testIds } },
          { _id: { $in: testIds.filter(id => id.length === 24) } }
        ]
      }, 'testId name');
    }

    if (packageIds.length > 0) {
      packages = await LabPackage.find({
        $or: [
          { packageId: { $in: packageIds } },
          { _id: { $in: packageIds.filter(id => id.length === 24) } }
        ]
      }, 'packageId name');
    }

    const testMap = new Map<string, string>();
    tests.forEach(t => { testMap.set(t.testId, t.name); testMap.set(t._id.toString(), t.name); });
    const packageMap = new Map<string, string>();
    packages.forEach(p => { packageMap.set(p.packageId, p.name); packageMap.set(p._id.toString(), p.name); });

    const enrichedBookings = bookings.map(b => ({
      ...b.toObject(),
      tests: (b.testIds || []).filter(id => testMap.has(id)).map(id => testMap.get(id)),
      packages: (b.packageIds || []).filter(id => packageMap.has(id)).map(id => packageMap.get(id)),
    }));
    
    res.json({
      success: true,
      bookings: enrichedBookings,
      total: enrichedBookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PATCH /api/bookings/:id/cancel - Cancel a booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled',
      });
    }
    
    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    
    res.json({
      success: true,
      booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
