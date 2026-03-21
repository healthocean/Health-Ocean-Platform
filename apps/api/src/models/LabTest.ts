import mongoose, { Document, Schema } from 'mongoose';

export interface ILabTest extends Document {
  labId: string;
  testId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  sampleType: string;
  turnaroundTime: string;
  preparationRequired: boolean;
  preparationInstructions?: string;
  parameters: string[];
  gender: 'Male' | 'Female' | 'Both';
  organ: string;
  ageGroup: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const labTestSchema = new Schema<ILabTest>(
  {
    labId: {
      type: String,
      required: true,
      ref: 'Lab',
    },
    testId: {
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
    originalPrice: Number,
    sampleType: {
      type: String,
      required: true,
    },
    turnaroundTime: {
      type: String,
      required: true,
    },
    preparationRequired: {
      type: Boolean,
      default: false,
    },
    preparationInstructions: String,
    parameters: [String],
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Both'],
      default: 'Both',
    },
    organ: {
      type: String,
      default: 'General',
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

export const LabTest = mongoose.model<ILabTest>('LabTest', labTestSchema);
