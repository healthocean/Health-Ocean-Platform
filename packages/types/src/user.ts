import { Address, UserType } from './common';

export interface User {
  id: string;
  email: string;
  phone: string;
  userType: UserType;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends User {
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: Address;
  medicalHistory?: Record<string, any>;
  subscriptionId?: string;
}

export interface Lab extends User {
  labName: string;
  nablCertificationNumber?: string;
  certificationValidUntil?: Date;
  address: Address;
  serviceAreas: string[]; // Array of pincodes/cities
  contactPerson: string;
  contactPhone: string;
  rating: number;
  totalRatings: number;
}

export interface Phlebotomist extends User {
  certifications?: string[];
  skills?: string[];
  serviceAreas: string[];
  availability: {
    days: string[]; // ['monday', 'tuesday', ...]
    timeSlots: string[]; // ['morning', 'afternoon', 'evening']
  };
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
}

export interface Admin extends User {
  permissions: string[];
  role: 'super_admin' | 'admin' | 'support';
}

export interface UserCreateInput {
  email: string;
  phone: string;
  password: string;
  userType: UserType;
  firstName?: string;
  lastName?: string;
}

export interface PatientCreateInput extends UserCreateInput {
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: Address;
}

export interface LabCreateInput extends UserCreateInput {
  labName: string;
  nablCertificationNumber?: string;
  certificationValidUntil?: Date;
  address: Address;
  serviceAreas: string[];
  contactPerson: string;
  contactPhone: string;
}

export interface PhlebotomistCreateInput extends UserCreateInput {
  certifications?: string[];
  skills?: string[];
  serviceAreas: string[];
  availability: {
    days: string[];
    timeSlots: string[];
  };
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}