import axios from 'axios';
import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

let accessToken = null;
let currentBaseUrl = API_BASE_URL;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const api = axios.create({ baseURL: currentBaseUrl });

export const setBaseUrl = (url) => {
  if (url && typeof url === 'string') {
    currentBaseUrl = url;
    api.defaults.baseURL = url;
  }
};

export const getBaseUrl = () => currentBaseUrl;

export const initApiBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem('api_override');
    if (saved) setBaseUrl(saved);
  } catch {}
};

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
