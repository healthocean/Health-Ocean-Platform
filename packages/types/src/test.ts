export interface Test {
  id: string;
  testCode: string;
  name: string;
  description?: string;
  category: string;
  sampleType: string;
  preparationInstructions?: string;
  fastingRequired: boolean;
  turnaroundHours: number;
  isActive: boolean;
  createdAt: Date;
}

export interface LabTestPrice {
  id: string;
  labId: string;
  testId: string;
  basePrice: number;
  platformCommission: number; // 15-40%
  finalPrice: number;
  isAvailable: boolean;
  dailyCapacity?: number;
}

export interface TestSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  labId?: string;
  sampleType?: string;
  city?: string;
  pincode?: string;
  sortBy?: 'price' | 'rating' | 'distance' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface HealthPackage {
  id: string;
  name: string;
  description: string;
  tests: string[]; // Array of test IDs
  originalPrice: number;
  discountedPrice: number;
  validityDays: number;
  benefits: string[];
  isActive: boolean;
}

export interface TestVariant {
  id: string;
  testId: string;
  name: string;
  description?: string;
  additionalRequirements?: string;
  priceMultiplier: number; // e.g., 1.2 for 20% more expensive variant
}