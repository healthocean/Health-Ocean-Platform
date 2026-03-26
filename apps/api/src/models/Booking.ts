import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  date: string;
  timeSlot: string;
  testIds?: string[];
  packageIds?: string[];
  labId?: string;
  couponCode?: string;
  discount?: number;
  total?: number;
  totalAmount?: number;
  status: 'Confirmed' | 'Cancelled' | 'Completed' | 'In Progress';
  phlebotomistAssigned: boolean;
  assignedTo?: string; // employeeId
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  userEmail?: string;
  location?: string;
  appointmentDate?: string;
  reportUrl?: string; // New field for report upload
  userLocation?: {
    type: string;
    coordinates: number[];
  };
  journeyStarted?: boolean;
  journeyStartedAt?: Date;
  phlebotomistLocation?: {
    type: string;
    coordinates: number[];
  };
  collectionOtp?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
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
    pincode: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    testIds: [String],
    packageIds: [String],
    labId: String,
    couponCode: String,
    discount: Number,
    total: Number,
    totalAmount: Number,
    userEmail: String,
    location: String,
    appointmentDate: String,
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Completed', 'In Progress'],
      default: 'Confirmed',
    },
    phlebotomistAssigned: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: String,
      default: null,
    },
    reportUrl: String,
    userLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    journeyStarted: {
      type: Boolean,
      default: false,
    },
    journeyStartedAt: Date,
    phlebotomistLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    collectionOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
