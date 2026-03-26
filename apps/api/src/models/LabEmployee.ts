import mongoose, { Document, Schema } from 'mongoose';

export interface ILabEmployee extends Document {
  labId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Technician' | 'Receptionist';
  employeeId: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const labEmployeeSchema = new Schema<ILabEmployee>(
  {
    labId: {
      type: String,
      required: true,
      ref: 'Lab',
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
      enum: ['Admin', 'Manager', 'Technician', 'Receptionist'],
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
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

export const LabEmployee = mongoose.model<ILabEmployee>('LabEmployee', labEmployeeSchema);
