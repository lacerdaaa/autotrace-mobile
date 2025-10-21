import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Config } from '@/constants/config';
import { api } from './client';
import { CertificateValidation } from './types';

export const validateCertificate = async (certificateId: string): Promise<CertificateValidation> => {
  const { data } = await api.get<CertificateValidation>(`/certificates/validate/${certificateId}`);
  return data;
};

export const downloadCertificatePdf = async (vehicleId: string, token: string) => {
  const url = `${Config.apiBaseUrl}/certificates/${vehicleId}`;
  const fileName = `certificate-${vehicleId}-${Date.now()}.pdf`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  const { uri } = await FileSystem.downloadAsync(url, fileUri, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return uri;
};

export const shareCertificate = async (fileUri: string) => {
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
    });
  }

  return fileUri;
};
