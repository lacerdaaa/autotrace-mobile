const DEFAULT_API_URL = 'http://172.20.10.2:3001';

export const Config = {
  apiBaseUrl: DEFAULT_API_URL,
  authTokenKey: 'autotrace',
};

export type ConfigKey = keyof typeof Config;

export const getConfig = (key: ConfigKey) => Config[key];
