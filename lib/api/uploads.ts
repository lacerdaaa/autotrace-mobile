import { api } from './client';

export type UploadCategory = 'vehicle-photo' | 'maintenance-document';

export type PresignedUpload = {
  fileName: string;
  uploadUrl: string;
  uploadMethod: 'PUT';
  uploadHeaders: Record<string, string>;
  publicUrl: string;
  expiresAt: string;
};

type PresignResponse = {
  upload: PresignedUpload;
};

export const requestPresignedUpload = async (params: {
  category: UploadCategory;
  originalName: string;
  contentType: string;
}): Promise<PresignedUpload> => {
  const { data } = await api.post<PresignResponse>('/uploads/presign', {
    category: params.category,
    originalName: params.originalName,
    contentType: params.contentType,
  });

  return data.upload;
};
