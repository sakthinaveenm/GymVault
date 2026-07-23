import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        // Simulate minor API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        // Simple mock login validation: accept any input as long as it has length
        if (email.trim() && password.length >= 6) {
          const name = email.split('@')[0];
          set({
            user: { email, name: name.charAt(0).toUpperCase() + name.slice(1) },
            isLoading: false,
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },
      register: async (email, name, password) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (email.trim() && name.trim() && password.length >= 6) {
          set({
            user: { email, name },
            isLoading: false,
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'gymvault-auth',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
