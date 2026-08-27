export type TransmissionType = 'MANUAL' | 'AUTOMATIC';
export type FuelType = 'FLEX' | 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
export type VehicleStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';

export interface VehicleCard {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  modelYear: number;
  mileage: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  price: string;
  rawPrice: string;
  coverImageUrl: string;
  featured: boolean;
  status: VehicleStatus;
  highlights: string;
}

export interface VehicleImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
  cover: boolean;
}

export interface VehicleDetail extends VehicleCard {
  version: string;
  color: string;
  doors: number;
  description: string;
  images: VehicleImage[];
}

export interface AdminVehicle {
  id: string;
  slug: string;
  title: string;
  price: string;
  status: VehicleStatus;
  featured: boolean;
  coverImageUrl: string;
}

export interface AdminDashboard {
  total: number;
  highlighted: number;
  published: number;
  vehicles: AdminVehicle[];
}

export interface LoginResponse {
  token: string;
  fullName: string;
  email: string;
}

export interface VehicleFormPayload {
  title: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  modelYear: number;
  price: number;
  mileage: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  color: string;
  doors: number;
  description: string;
  highlights: string;
  featured: boolean;
  status: VehicleStatus;
}

export interface LeadPayload {
  customerName: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface VehicleFilters {
  search?: string;
  brand?: string;
  minYear?: number;
  maxPrice?: number;
}
