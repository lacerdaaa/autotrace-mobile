import { File } from 'expo-file-system';

import { Config } from '@/constants/config';
import type { PresignedUpload } from './api/uploads';

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const resolveUploadUrl = (uploadUrl: string): string => {
  if (isAbsoluteUrl(uploadUrl)) {
    return uploadUrl;
  }

  return `${trimTrailingSlash(Config.apiBaseUrl)}${uploadUrl}`;
};

export const uploadFileToPresignedUrl = async (params: { uri: string; upload: PresignedUpload }): Promise<void> => {
  const targetUrl = resolveUploadUrl(params.upload.uploadUrl);

  console.info('[upload] iniciando envio para URL pré-assinada', {
    fileName: params.upload.fileName,
    targetUrl: targetUrl.split('?')[0],
    method: params.upload.uploadMethod,
  });

  const file = new File(params.uri);
  const fileBuffer = await file.arrayBuffer();
  const contentLength = fileBuffer.byteLength;

  console.info('[upload] arquivo lido', {
    fileName: params.upload.fileName,
    size: contentLength,
  });

  const response = await fetch(targetUrl, {
    method: params.upload.uploadMethod,
    headers: {
      ...params.upload.uploadHeaders,
      'Content-Length': String(contentLength),
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error('[upload] falha ao enviar arquivo', {
      fileName: params.upload.fileName,
      status: response.status,
      body: errorMessage,
    });
    throw new Error(errorMessage || `Upload falhou com status ${response.status}`);
  }

  console.info('[upload] arquivo enviado com sucesso', {
    fileName: params.upload.fileName,
    publicUrl: params.upload.publicUrl,
  });
};
