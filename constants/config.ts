const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.15.7:3001';

export const Config = {
  apiBaseUrl: DEFAULT_API_URL,
  authTokenKey: 'autotrace',
};

export type ConfigKey = keyof typeof Config;

export const getConfig = (key: ConfigKey) => Config[key];
