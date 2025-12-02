import axios from 'axios';
import { API_BASE_URL } from './config';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (accessToken) {
    if (!config.headers) config.headers = {};
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  return config;
});
