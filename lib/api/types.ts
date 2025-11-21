export type UserRole = 'user' | 'admin';

export type VehicleCategory = 'car' | 'motorcycle' | 'truck' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  plate: string;
  model: string;
  manufacturer: string;
  year: number;
  category: VehicleCategory;
  averageMonthlyKm: number;
  initialOdometer?: number | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehiclePhoto {
  id: string;
  vehicleId: string;
  fileName: string;
  url: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  userId: string;
  serviceType: string;
  serviceDate: string;
  odometer: number;
  workshop: string;
  notes?: string | null;
  documentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceSuggestionCheckpoint {
  kmMark: number;
  overdue: boolean;
  checklist: string[];
}

export interface MaintenanceSuggestions {
  estimatedCurrentKm: number;
  monthlyAverageKm: number;
  nextMaintenanceKm: number | null;
  kmToNext: number | null;
  overdue: boolean;
  estimatedDueDate: string | null;
  checklist: string[];
  upcoming: MaintenanceSuggestionCheckpoint[];
}

export interface VehicleWithDetails {
  vehicle: Vehicle;
  photos: VehiclePhoto[];
  maintenances: MaintenanceRecord[];
  suggestions: MaintenanceSuggestions;
}

export interface VehicleResponse {
  vehicle: Vehicle;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
}

export interface DashboardSummaryItem {
  vehicleId: string;
  vehiclePlate?: string;
  totalMaintenances: number;
  lastMaintenanceDate: string | null;
  nextMaintenanceKm: number | null;
  overdue: boolean;
}

export interface DashboardResponse {
  dashboard: DashboardSummaryItem[];
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CertificateValidation {
  certificate: {
    id: string;
    vehicleId: string;
    vehiclePlate: string;
    generatedAt: string;
    maintenanceCount: number;
    lastMaintenanceDate: string | null;
    overdue: boolean;
  };
}

export interface CertificateGenerationResult {
  certificateId: string;
  fileUri: string;
}
