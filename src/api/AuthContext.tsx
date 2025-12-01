import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { decode as atob } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAccessToken } from './client';

interface AuthState {
  user: { id: number; username: string; role: 'USER' | 'ADMIN' } | null;
  access: string | null;
  refresh: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (payload: { username: string; email?: string; password: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, access: null, refresh: null });

  // Hydrate from storage on app launch
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          setState(parsed);
          setAccessToken(parsed.access || null);
        }
      } catch (_) {}
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/token/', { username, password });
    const { access, refresh } = data;
    // decode JWT payload to get user info added in backend token (username, role)
  const payload = JSON.parse(atob(access.split('.')[1]));
    const user = { id: payload.user_id || 0, username: payload.username, role: payload.role };
    setAccessToken(access);
    setState({ user, access, refresh });
    await AsyncStorage.setItem('auth', JSON.stringify({ access, refresh, user }));
  };

  const register = async (payload: { username: string; email?: string; password: string; first_name?: string; last_name?: string }) => {
    await api.post('/register/', payload);
    await login(payload.username, payload.password);
  };

  const logout = async () => {
    try {
      if (state.refresh) {
        await api.post('/auth/logout/', { refresh: state.refresh });
      }
    } catch (_) {
      // ignore network/token errors on logout
    } finally {
      setAccessToken(null);
      setState({ user: null, access: null, refresh: null });
      await AsyncStorage.removeItem('auth');
    }
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all/', {});
    } catch (_) {
    } finally {
      await logout();
    }
  };

  const value = useMemo(() => ({ ...state, login, register, logout, logoutAll }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
