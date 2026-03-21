import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Admin } from '../models/Admin';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-ocean';

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'SuperAdmin' });
    if (existingSuperAdmin) {
      console.log('⚠️  SuperAdmin already exists:');
      console.log('   Email:', existingSuperAdmin.email);
      console.log('   Name:', existingSuperAdmin.name);
      await mongoose.disconnect();
      return;
    }

    // Create SuperAdmin
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    const superAdmin = await Admin.create({
      adminId: 'SUPERADMIN001',
      name: 'Super Admin',
      email: 'superadmin@healthocean.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'SuperAdmin',
      status: 'Active',
    });

    console.log('✅ SuperAdmin created successfully!');
    console.log('');
    console.log('📧 Email: superadmin@healthocean.com');
    console.log('🔑 Password: superadmin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
