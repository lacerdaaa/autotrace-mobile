import axios, { AxiosError } from 'axios';

import { Config } from '@/constants/config';

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const api = axios.create({
  baseURL: 'http://172.20.10.2:3001',
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const headers = config.headers ?? {};

  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return { ...config, headers };
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);

export const setApiToken = (token: string | null) => {
  authToken = token;
};

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export type ApiErrorPayload = {
  error?: string;
  message?: string;
  details?: unknown;
};

export type ApiError<T = ApiErrorPayload> = AxiosError<T>;

export const getApiErrorMessage = (error: ApiError) => {
  if (error.response?.data) {
    const data = error.response.data as ApiErrorPayload;
    return data.error ?? data.message ?? 'Algo deu errado ao comunicar com a API.';
  }

  if (error.message) {
    return error.message;
  }

  return 'Erro inesperado ao comunicar com a API.';
};

export const isApiError = (error: unknown): error is ApiError => axios.isAxiosError(error);
