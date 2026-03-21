import { Router } from 'express';
import { LabTest } from '../models/LabTest';
import { LabPackage } from '../models/LabPackage';

const router = Router();

// GET /api/search?q=query
router.get('/', async (req, res) => {
  try {
    const searchTerm = (req.query.q as string) || (req.query.query as string);
    if (!searchTerm) {
      return res.json({ success: true, tests: [], packages: [], results: [] });
    }

    const regex = new RegExp(searchTerm, 'i');

    const tests = await LabTest.aggregate([
      { $match: { $or: [{ name: regex }, { description: regex }, { category: regex }, { organ: regex }] } },
      { $lookup: { from: 'labs', localField: 'labId', foreignField: 'labId', as: 'labInfo' } },
      { $unwind: { path: '$labInfo', preserveNullAndEmptyArrays: true } }
    ]);

    const packages = await LabPackage.aggregate([
      { $match: { $or: [{ name: regex }, { description: regex }, { category: regex }, { organ: regex }] } },
      { $lookup: { from: 'labs', localField: 'labId', foreignField: 'labId', as: 'labInfo' } },
      { $unwind: { path: '$labInfo', preserveNullAndEmptyArrays: true } }
    ]);

    const testResults = tests.map(t => ({ 
      ...t, 
      type: 'test',
      labName: t.labInfo?.name || 'Unknown Lab',
      labCity: t.labInfo?.city || '',
      labRating: t.labInfo?.rating || 0
    }));

    const packageResults = packages.map(p => ({ 
      ...p, 
      type: 'package',
      labName: p.labInfo?.name || 'Unknown Lab',
      labCity: p.labInfo?.city || '',
      labRating: p.labInfo?.rating || 0
    }));

    const results = [...testResults, ...packageResults];

    res.json({
      success: true,
      tests: testResults,
      packages: packageResults,
      results,
      total: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
