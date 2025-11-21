import { api } from './client';
import { requestPresignedUpload } from './uploads';
import { uploadFileToPresignedUrl } from '../uploads';
import {
  MaintenanceRecord,
  Vehicle,
  VehiclePhoto,
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

export interface MaintenanceDocumentPayload {
  uri: string;
  name: string;
  type: string;
}

export interface CreateMaintenancePayload {
  vehicleId: string;
  serviceType: string;
  serviceDate: string;
  odometer: number;
  workshop: string;
  notes?: string;
  document?: MaintenanceDocumentPayload | null;
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

type VehiclePhotoResponse = {
  vehicle: Vehicle;
  photo: VehiclePhoto;
};

export const uploadVehiclePhoto = async ({
  vehicleId,
  uri,
  fileName,
  mimeType,
}: UpdateVehiclePhotoPayload): Promise<VehiclePhoto> => {
  const upload = await requestPresignedUpload({
    category: 'vehicle-photo',
    originalName: fileName,
    contentType: mimeType,
  });

  await uploadFileToPresignedUrl({ uri, upload });

  const { data } = await api.post<VehiclePhotoResponse>(`/vehicles/${vehicleId}/photo`, {
    fileName: upload.fileName,
  });

  return data.photo;
};

export const createMaintenanceRecord = async (
  payload: CreateMaintenancePayload,
): Promise<MaintenanceRecord> => {
  const { vehicleId, document, ...rest } = payload;

  let documentFileName: string | undefined;
  if (document) {
    const upload = await requestPresignedUpload({
      category: 'maintenance-document',
      originalName: document.name,
      contentType: document.type,
    });

    await uploadFileToPresignedUrl({ uri: document.uri, upload });
    documentFileName = upload.fileName;
  }

  const body = {
    ...rest,
    ...(documentFileName ? { documentFileName } : {}),
  };

  const { data } = await api.post<{ maintenance: MaintenanceRecord }>(`/vehicles/${vehicleId}/maintenance`, body);

  return data.maintenance;
};
