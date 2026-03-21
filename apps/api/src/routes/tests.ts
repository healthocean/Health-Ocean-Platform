import { Router } from 'express';
import { LabTest } from '../models/LabTest';
import { Lab } from '../models/Lab';

const router = Router();

// GET /api/tests - Get all active tests from approved labs, with lab name
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };

    const approvedLabs = await Lab.find({ status: 'Approved' }).select('labId name city');
    const approvedLabIds = approvedLabs.map(l => l.labId);
    const labMap = new Map(approvedLabs.map(l => [l.labId, { name: l.name, city: l.city }]));

    const query: any = { labId: { $in: approvedLabIds }, status: 'Active' };

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && typeof category === 'string') {
      query.category = category;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
      LabTest.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      LabTest.countDocuments(query)
    ]);

    const result = tests.map(t => ({
      id: t._id,
      testId: t.testId,
      name: t.name,
      description: t.description,
      price: t.price,
      originalPrice: t.originalPrice,
      category: t.category,
      turnaroundTime: t.turnaroundTime,
      sampleType: t.sampleType,
      preparationRequired: t.preparationRequired,
      preparationInstructions: t.preparationInstructions,
      parameters: t.parameters,
      labId: t.labId,
      labName: labMap.get(t.labId)?.name ?? '',
      labCity: labMap.get(t.labId)?.city ?? '',
    }));

    res.json({ 
      tests: result, 
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tests/meta/categories - Get distinct categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await LabTest.distinct('category', { status: 'Active' });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tests/:id - Get single test with full lab info
router.get('/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const lab = await Lab.findOne({ labId: test.labId }).select('-password');
    res.json({
      ...test.toObject(),
      labName: lab?.name ?? '',
      labCity: lab?.city ?? '',
      lab: lab ? {
        labId: lab.labId,
        name: lab.name,
        city: lab.city,
        state: lab.state,
        address: lab.address,
        phone: lab.phone,
        email: lab.email,
        nablCertificate: lab.nablCertificate,
        establishedYear: lab.establishedYear,
        rating: lab.rating,
        operatingHours: lab.operatingHours,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
