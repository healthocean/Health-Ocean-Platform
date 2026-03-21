import { Router } from 'express';
import { LabPackage } from '../models/LabPackage';
import { Lab } from '../models/Lab';

const router = Router();

// GET /api/packages - Get all active packages from approved labs, with lab name
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

    const [packages, total] = await Promise.all([
      LabPackage.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      LabPackage.countDocuments(query)
    ]);

    const result = packages.map(p => ({
      id: p._id,
      packageId: p.packageId,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category,
      testsIncluded: p.testsIncluded,
      features: p.features,
      labId: p.labId,
      labName: labMap.get(p.labId)?.name ?? '',
      labCity: labMap.get(p.labId)?.city ?? '',
    }));

    res.json({ 
      packages: result, 
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/packages/meta/categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await LabPackage.distinct('category', { status: 'Active' });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/packages/:id
router.get('/:id', async (req, res) => {
  try {
    const pkg = await LabPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const lab = await Lab.findOne({ labId: pkg.labId }).select('name city');
    res.json({ ...pkg.toObject(), labName: lab?.name ?? '', labCity: lab?.city ?? '' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
