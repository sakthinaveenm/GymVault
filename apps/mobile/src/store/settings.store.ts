import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  unitSystem: 'metric' | 'imperial';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleUnitSystem: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark', // Dark Mode first as per Readme
      unitSystem: 'metric',
      setTheme: (theme) => set({ theme }),
      toggleUnitSystem: () =>
        set((state) => ({
          unitSystem: state.unitSystem === 'metric' ? 'imperial' : 'metric',
        })),
    }),
    {
      name: 'gymvault-settings',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
