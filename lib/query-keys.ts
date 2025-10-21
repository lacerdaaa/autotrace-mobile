export const queryKeys = {
  dashboard: ['dashboard'] as const,
  vehicles: {
    root: ['vehicles'] as const,
    detail: (vehicleId: string) => ['vehicle', vehicleId] as const,
  },
  certificates: {
    validate: (certificateId: string) => ['certificate', certificateId] as const,
  },
};
