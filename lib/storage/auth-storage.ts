import * as SecureStore from 'expo-secure-store';

import { Config } from '@/constants/config';

const TOKEN_KEY = Config.authTokenKey;

let secureStoreAvailable: boolean | null = null;
let memoryToken: string | null = null;

const isSecureStoreAvailable = async () => {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
};

const fallbackSetToken = (token: string | null) => {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      if (token) {
        globalThis.localStorage.setItem(TOKEN_KEY, token);
      } else {
        globalThis.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
  } catch {
    // Ignored – fallback to memory store.
  }

  memoryToken = token;
};

const fallbackGetToken = () => {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage.getItem(TOKEN_KEY);
    }
  } catch {
    // Ignored – fallback to memory store.
  }

  return memoryToken;
};

export const saveToken = async (token: string) => {
  if (!token) {
    await removeToken();
    return;
  }

  const available = await isSecureStoreAvailable();

  if (available && typeof SecureStore.setItemAsync === 'function') {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    fallbackSetToken(token);
  }
};

export const removeToken = async () => {
  const available = await isSecureStoreAvailable();

  if (available && typeof SecureStore.deleteItemAsync === 'function') {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Fallthrough to ensure fallback store is cleared.
    }
  }

  fallbackSetToken(null);
};

export const getToken = async () => {
  const available = await isSecureStoreAvailable();

  if (available && typeof SecureStore.getItemAsync === 'function') {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      fallbackSetToken(token);
    }
    return token;
  }

  return fallbackGetToken() ?? null;
};
