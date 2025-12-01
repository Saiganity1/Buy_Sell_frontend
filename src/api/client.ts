import axios from 'axios';
import { API_BASE_URL } from './config';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (accessToken) {
    if (!config.headers) config.headers = {} as any;
    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${accessToken}`);
    } else {
      (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  return config;
});
