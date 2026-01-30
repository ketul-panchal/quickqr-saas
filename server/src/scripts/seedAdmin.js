import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickqr';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: String,
      phone: String,
      role: { type: String, default: 'user' },
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: true },
      subscription: {
        plan: { type: String, default: 'enterprise' },
        status: { type: String, default: 'active' },
        features: {
          maxRestaurants: { type: Number, default: 999 },
          maxMenuItems: { type: Number, default: 9999 },
          maxScansPerMonth: { type: Number, default: 999999 },
        },
      },
    }, { timestamps: true }));

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@quickqr.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('\n📧 Email: admin@quickqr.com');
      console.log('🔑 Password: Admin@123');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create admin user
    const admin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@quickqr.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        features: {
          maxRestaurants: 999,
          maxMenuItems: 9999,
          maxScansPerMonth: 999999,
        },
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Email: admin@quickqr.com');
    console.log('🔑 Password: Admin@123');
    console.log('\n🔐 Login at: http://localhost:5173/admin/login\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
