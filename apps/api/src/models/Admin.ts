import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  adminId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'SuperAdmin' | 'Admin';
  status: 'Active' | 'Inactive';
  createdBy?: string; // Admin ID of creator (for regular admins)
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    adminId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    createdBy: {
      type: String,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
