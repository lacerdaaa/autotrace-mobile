import { api } from './client';
import {
  MaintenanceRecord,
  Vehicle,
  VehicleResponse,
  VehiclesResponse,
  VehicleWithDetails,
} from './types';

export interface CreateVehiclePayload {
  plate: string;
  model: string;
  manufacturer: string;
  year: number;
  category: 'car' | 'motorcycle';
  averageMonthlyKm: number;
  initialOdometer?: number;
}

export interface UpdateVehiclePhotoPayload {
  vehicleId: string;
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface CreateMaintenancePayload {
  vehicleId: string;
  serviceType: string;
  serviceDate: string;
  odometer: number;
  workshop: string;
  notes?: string;
  document?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

export const listVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await api.get<VehiclesResponse>('/vehicles');
  return data.vehicles;
};

export const getVehicleDetails = async (vehicleId: string): Promise<VehicleWithDetails> => {
  const { data } = await api.get<VehicleWithDetails>(`/vehicles/${vehicleId}`);
  return data;
};

export const createVehicle = async (payload: CreateVehiclePayload): Promise<Vehicle> => {
  const { data } = await api.post<VehicleResponse>('/vehicles', payload);
  return data.vehicle;
};

export const uploadVehiclePhoto = async ({
  vehicleId,
  uri,
  fileName,
  mimeType,
}: UpdateVehiclePhotoPayload): Promise<Vehicle> => {
  const formData = new FormData();
  formData.append('photo', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as any);

  const { data } = await api.post<VehicleResponse>(`/vehicles/${vehicleId}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.vehicle;
};

export const createMaintenanceRecord = async (
  payload: CreateMaintenancePayload,
): Promise<MaintenanceRecord> => {
  const { vehicleId, document, ...rest } = payload;

  const formData = new FormData();

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });

  if (document) {
    formData.append('document', {
      uri: document.uri,
      name: document.name,
      type: document.type,
    } as unknown as any);
  }

  const { data } = await api.post<{ maintenance: MaintenanceRecord }>(
    `/vehicles/${vehicleId}/maintenance`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return data.maintenance;
};
