import mongoose, { Document, Schema } from 'mongoose';

export interface ILab extends Document {
  labId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  nablCertificate: string;
  isoCertificate?: string;
  licenseNumber: string;
  establishedYear: number;
  description?: string;
  operatingHours: {
    open: string;
    close: string;
  };
  servicesOffered: string[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  rating: number;
  totalBookings: number;
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const labSchema = new Schema<ILab>(
  {
    labId: {
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
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    nablCertificate: {
      type: String,
      required: true,
    },
    isoCertificate: String,
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    establishedYear: {
      type: Number,
      required: true,
    },
    description: String,
    operatingHours: {
      open: {
        type: String,
        default: '08:00',
      },
      close: {
        type: String,
        default: '20:00',
      },
    },
    servicesOffered: [String],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
      default: 'Pending',
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },
  },
  {
    timestamps: true,
  }
);

labSchema.index({ location: '2dsphere' });

export const Lab = mongoose.model<ILab>('Lab', labSchema);
