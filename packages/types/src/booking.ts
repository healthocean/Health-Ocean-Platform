import { Address } from './common';

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_progress'
  | 'collected'
  | 'in_transit'
  | 'at_lab'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  bookingNumber: string;
  patientId: string;
  status: BookingStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  scheduledDate: Date;
  scheduledSlot: 'morning' | 'afternoon' | 'evening';
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  testId: string;
  labId: string;
  price: number;
  status: BookingStatus;
  assignedPhlebotomistId?: string;
  sampleBarcode?: string;
  reportUrl?: string;
  createdAt: Date;
}

export interface BookingCreateInput {
  patientId: string;
  tests: Array<{
    testId: string;
    labId?: string; // If not provided, system will assign
  }>;
  scheduledDate: Date;
  scheduledSlot: 'morning' | 'afternoon' | 'evening';
  address: Address;
  discountCode?: string;
}

export interface PhlebotomistAssignment {
  id: string;
  phlebotomistId: string;
  bookingItemId: string;
  assignmentStatus: 'assigned' | 'en_route' | 'arrived' | 'collecting' | 'collected' | 'delivered' | 'cancelled';
  estimatedArrival?: Date;
  actualArrival?: Date;
  collectionStart?: Date;
  collectionEnd?: Date;
  deliveryToHub?: Date;
  notes?: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  bookingItemId: string;
  reportUrl: string;
  reportFormat: 'pdf' | 'json' | 'hl7';
  uploadedBy: string;
  uploadedAt: Date;
  isCritical: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  status: 'initiated' | 'success' | 'failed' | 'refunded';
  gatewayResponse?: Record<string, any>;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
}