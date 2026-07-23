import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';
import { API_URL } from '@/constants/api';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const json = await response.json();
          if (json.success && json.data?.token) {
            set({
              user: json.data.user,
              token: json.data.token,
              isLoading: false,
            });
            return true;
          }
        } catch (e) {
          console.warn('API login failed. Falling back to offline local login.');
          // Offline fallback
          if (email.trim() && password.length >= 6) {
            const name = email.split('@')[0];
            set({
              user: { email, name: name.charAt(0).toUpperCase() + name.slice(1) },
              token: 'mock-offline-token',
              isLoading: false,
            });
            return true;
          }
        }
        set({ isLoading: false });
        return false;
      },
      register: async (email, name, password) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
          });
          const json = await response.json();
          if (json.success && json.data?.token) {
            set({
              user: json.data.user,
              token: json.data.token,
              isLoading: false,
            });
            return true;
          }
        } catch (e) {
          console.warn('API registration failed. Falling back to offline signup.');
          // Offline fallback
          if (email.trim() && name.trim() && password.length >= 6) {
            set({
              user: { email, name },
              token: 'mock-offline-token',
              isLoading: false,
            });
            return true;
          }
        }
        set({ isLoading: false });
        return false;
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'gymvault-auth',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
