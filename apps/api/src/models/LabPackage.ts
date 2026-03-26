import mongoose, { Document, Schema } from 'mongoose';

export interface ILabPackage extends Document {
  labId: string;
  packageId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  testsIncluded: string[];
  features: string[];
  gender: 'Male' | 'Female' | 'Both';
  organ: string;
  ageGroup: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const labPackageSchema = new Schema<ILabPackage>(
  {
    labId: {
      type: String,
      required: true,
      ref: 'Lab',
    },
    packageId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    testsIncluded: [String],
    features: [String],
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Both'],
      default: 'Both',
    },
    organ: {
      type: String,
      default: 'Multiple Organs',
    },
    ageGroup: {
      type: String,
      default: 'All Ages',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const LabPackage = mongoose.model<ILabPackage>('LabPackage', labPackageSchema);
