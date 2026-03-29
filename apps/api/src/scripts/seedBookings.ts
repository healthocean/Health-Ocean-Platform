import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI!;

// ── Real data from DB ──────────────────────────────────────────────────────────
const LABS = [
  { labId: 'LAB001', city: 'Delhi' },
  { labId: 'LAB002', city: 'Delhi' },
  { labId: 'LAB003', city: 'Mumbai' },
  { labId: 'LAB004', city: 'Mumbai' },
  { labId: 'LAB005', city: 'Bangalore' },
  { labId: 'LAB006', city: 'Bangalore' },
  { labId: 'LAB007', city: 'Hyderabad' },
  { labId: 'LAB008', city: 'Chennai' },
  { labId: 'LAB009', city: 'Pune' },
  { labId: 'LAB010', city: 'Kolkata' },
];

// testId → { labId, price }
const TESTS: { testId: string; labId: string; price: number }[] = [
  { testId: 'TEST000001', labId: 'LAB001', price: 290 },
  { testId: 'TEST000002', labId: 'LAB001', price: 750 },
  { testId: 'TEST000003', labId: 'LAB001', price: 260 },
  { testId: 'TEST000004', labId: 'LAB001', price: 710 },
  { testId: 'TEST000005', labId: 'LAB001', price: 1880 },
  { testId: 'TEST000010', labId: 'LAB001', price: 210 },
  { testId: 'TEST000011', labId: 'LAB001', price: 470 },
  { testId: 'TEST000012', labId: 'LAB001', price: 910 },
  { testId: 'TEST000015', labId: 'LAB001', price: 1540 },
  { testId: 'TEST000023', labId: 'LAB002', price: 430 },
  { testId: 'TEST000024', labId: 'LAB002', price: 810 },
  { testId: 'TEST000028', labId: 'LAB002', price: 1800 },
  { testId: 'TEST000033', labId: 'LAB002', price: 210 },
  { testId: 'TEST000035', labId: 'LAB002', price: 850 },
  { testId: 'TEST000046', labId: 'LAB003', price: 390 },
  { testId: 'TEST000047', labId: 'LAB003', price: 330 },
  { testId: 'TEST000048', labId: 'LAB003', price: 770 },
  { testId: 'TEST000050', labId: 'LAB003', price: 500 },
];

const USERS = [
  { name: 'Tejas N Pawar',  email: 'tejaspawar62689@gmail.com', phone: '6268970238' },
  { name: 'Aarav',          email: 'aarav@gmail.com',           phone: '9121464075' },
  { name: 'Ishan',          email: 'ishan@gmail.com',           phone: '9324278680' },
  { name: 'Madhav',         email: 'madhav@gmail.com',          phone: '9440685214' },
  { name: 'Nisha',          email: 'nisha@gmail.com',           phone: '9583214849' },
  { name: 'Karthik',        email: 'karthik@gmail.com',         phone: '9123145632' },
  { name: 'Aditi',          email: 'aditi@gmail.com',           phone: '9345259989' },
  { name: 'Vikash',         email: 'vikash@gmail.com',          phone: '9308920421' },
  { name: 'Pragati',        email: 'pragati@gmail.com',         phone: '9772148571' },
  { name: 'Manoj',          email: 'manoj@gmail.com',           phone: '9982026892' },
];

const ADDRESSES = [
  { address: '12 Rajouri Garden, New Delhi', city: 'Delhi',     pincode: '110027' },
  { address: '45 Andheri West, Mumbai',      city: 'Mumbai',    pincode: '400058' },
  { address: '7 Koramangala, Bangalore',     city: 'Bangalore', pincode: '560034' },
  { address: '23 Banjara Hills, Hyderabad',  city: 'Hyderabad', pincode: '500034' },
  { address: '9 T Nagar, Chennai',           city: 'Chennai',   pincode: '600017' },
  { address: '18 Kothrud, Pune',             city: 'Pune',      pincode: '411038' },
  { address: '5 Salt Lake, Kolkata',         city: 'Kolkata',   pincode: '700091' },
  { address: '33 Lajpat Nagar, Delhi',       city: 'Delhi',     pincode: '110024' },
  { address: '67 Powai, Mumbai',             city: 'Mumbai',    pincode: '400076' },
  { address: '11 Whitefield, Bangalore',     city: 'Bangalore', pincode: '560066' },
];

const TIME_SLOTS = ['07:00 AM - 09:00 AM', '09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'];
const STATUSES: Array<'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'> = ['Confirmed', 'In Progress', 'Completed', 'Completed', 'Completed', 'Cancelled'];

// ── Helpers ────────────────────────────────────────────────────────────────────
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysAgo));
  d.setHours(randInt(0, 23), randInt(0, 59), randInt(0, 59), 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ── Build bookings ─────────────────────────────────────────────────────────────
function buildBookings(count: number) {
  const bookings = [];

  for (let i = 0; i < count; i++) {
    const user = rand(USERS);
    const addr = rand(ADDRESSES);
    const createdAt = randomDate(90); // spread over last 90 days

    // pick 1-3 tests from the same lab
    const labTests = TESTS.filter(t => t.labId === rand(LABS).labId);
    const picked = labTests.length > 0
      ? labTests.sort(() => 0.5 - Math.random()).slice(0, randInt(1, Math.min(3, labTests.length)))
      : [rand(TESTS)];

    const labId = picked[0].labId;
    const total = picked.reduce((s, t) => s + t.price, 0);
    const discount = Math.random() > 0.7 ? Math.round(total * 0.1) : 0;
    const totalAmount = total - discount;
    const status = rand(STATUSES);

    bookings.push({
      bookingId: `BK${Date.now()}${i}`,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: addr.address,
      city: addr.city,
      pincode: addr.pincode,
      date: formatDate(createdAt),
      timeSlot: rand(TIME_SLOTS),
      testIds: picked.map(t => t.testId),
      packageIds: [],
      labId,
      couponCode: discount > 0 ? rand(['HEALTH10', 'OCEAN20', 'FIRST15']) : null,
      discount,
      total,
      totalAmount,
      status,
      phlebotomistAssigned: status === 'In Progress' || status === 'Completed',
      reportUrl: status === 'Completed' ? null : null,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return bookings;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const col = db.collection('bookings');

  const existing = await col.countDocuments();
  if (existing > 0) {
    console.log(`Found ${existing} existing bookings. Dropping them first...`);
    await col.deleteMany({});
  }

  const bookings = buildBookings(200);
  await col.insertMany(bookings);
  console.log(`✅ Inserted ${bookings.length} bookings.`);

  // Summary
  const byStatus = await col.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray();
  const byCity   = await col.aggregate([{ $group: { _id: '$city',   count: { $sum: 1 } } }]).toArray();
  console.log('\nBy status:', byStatus);
  console.log('By city:',   byCity);

  await mongoose.disconnect();
  console.log('\nDone. Restart the API and refresh the admin panel.');
}

main().catch(e => { console.error(e); process.exit(1); });
