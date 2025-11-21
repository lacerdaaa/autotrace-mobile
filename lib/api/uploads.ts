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
  console.info('[upload] solicitando presign', {
    category: params.category,
    originalName: params.originalName,
    contentType: params.contentType,
  });

  try {
    const { data } = await api.post<PresignResponse>(
      '/uploads/presign',
      {
        category: params.category,
        originalName: params.originalName,
        contentType: params.contentType,
      },
      { timeout: 30_000 },
    );

    console.info('[upload] presign concluído', {
      category: params.category,
      fileName: data.upload.fileName,
      expiresAt: data.upload.expiresAt,
    });

    return data.upload;
  } catch (error) {
    console.error('[upload] erro ao obter presign', error);
    throw error;
  }
};
