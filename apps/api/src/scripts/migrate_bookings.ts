import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { LabTest } from '../models/LabTest';
import { LabPackage } from '../models/LabPackage';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-ocean';

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const bookings = await Booking.find({ 
    $or: [
      { labId: { $exists: false } }, 
      { labId: null }, 
      { labId: "" }
    ] 
  });
  console.log(`Found ${bookings.length} bookings without labId`);

  const firstLab = await mongoose.connection.db!.collection('labs').findOne();
  const fallbackLabId = firstLab ? firstLab.labId : undefined;

  for (const booking of bookings) {
    let labId: string | undefined;

    // Check packages
    if (booking.packageIds && booking.packageIds.length > 0) {
      for (const id of booking.packageIds) {
        const pkg = await LabPackage.findOne({
          $or: [
            { packageId: id },
            ...(id.match(/^[a-f\d]{24}$/i) ? [{ _id: id }] : [])
          ]
        });
        if (pkg) { labId = pkg.labId; break; }
      }
    }

    // Check tests
    if (!labId && booking.testIds && booking.testIds.length > 0) {
      for (const id of booking.testIds) {
        const test = await LabTest.findOne({
          $or: [
            { testId: id },
            ...(id.match(/^[a-f\d]{24}$/i) ? [{ _id: id }] : [])
          ]
        });
        if (test) { labId = test.labId; break; }
      }
    }

    // If still no labId (e.g. dummy testIds ["1", "5"]), assign to fallback
    if (!labId && fallbackLabId) {
       labId = fallbackLabId;
    }

    if (labId) {
      booking.labId = labId;
      await booking.save();
      console.log(`Updated booking ${booking.bookingId} with labId ${labId}`);
    } else {
      console.log(`Could not find labId for booking ${booking.bookingId}`);
    }
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(console.error);
