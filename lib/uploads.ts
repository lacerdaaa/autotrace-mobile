import * as FileSystem from 'expo-file-system';

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

  const result = await FileSystem.uploadAsync(targetUrl, params.uri, {
    httpMethod: params.upload.uploadMethod,
    headers: params.upload.uploadHeaders,
  });

  if (result.status < 200 || result.status >= 300) {
    const errorMessage = result.body || `Upload falhou com status ${result.status}`;
    throw new Error(errorMessage);
  }
};
