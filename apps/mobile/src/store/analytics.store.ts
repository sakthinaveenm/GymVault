import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';
import { useAuthStore } from './auth.store';
import { API_URL } from '@/constants/api';

export interface WeightEntry {
  id: string;
  weight: number;
  date: number;
}

export interface MeasurementEntry {
  id: string;
  chest: number;
  waist: number;
  arms: number;
  thighs: number;
  date: number;
}

export interface PersonalRecord {
  exerciseId: string;
  name: string;
  category: string;
  primaryMuscle: string;
  weight: number;
  reps: number;
  date: number;
}

interface AnalyticsState {
  weights: WeightEntry[];
  measurements: MeasurementEntry[];
  prs: PersonalRecord[];
  isLoading: boolean;

  syncAnalytics: () => Promise<void>;
  logWeight: (weight: number) => Promise<void>;
  logMeasurements: (
    chest: number,
    waist: number,
    arms: number,
    thighs: number
  ) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      weights: [],
      measurements: [],
      prs: [],
      isLoading: false,

      syncAnalytics: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ isLoading: true });
        try {
          // 1. Fetch Weight Logs
          const wRes = await fetch(`${API_URL}/analytics/weight`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const wJson = await wRes.json();
          if (wJson.success) {
            set({ weights: wJson.data });
          }

          // 2. Fetch Measurements
          const mRes = await fetch(`${API_URL}/analytics/measurements`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const mJson = await mRes.json();
          if (mJson.success) {
            set({ measurements: mJson.data });
          }

          // 3. Fetch Personal Records
          const pRes = await fetch(`${API_URL}/analytics/prs`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const pJson = await pRes.json();
          if (pJson.success) {
            set({ prs: pJson.data });
          }
        } catch (e) {
          console.warn('Offline: Failed to sync analytics data with server.');
        } finally {
          set({ isLoading: false });
        }
      },

      logWeight: async (weight) => {
        const token = useAuthStore.getState().token;
        const localEntry: WeightEntry = {
          id: Math.random().toString(36).substring(7),
          weight,
          date: Date.now(),
        };

        // Optimistic UI Update
        set((state) => ({ weights: [...state.weights, localEntry].sort((a, b) => a.date - b.date) }));

        if (!token) return;

        try {
          await fetch(`${API_URL}/analytics/weight`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ weight, date: localEntry.date }),
          });
          get().syncAnalytics();
        } catch (e) {
          console.warn('Offline: Logged body weight locally only.');
        }
      },

      logMeasurements: async (chest, waist, arms, thighs) => {
        const token = useAuthStore.getState().token;
        const localEntry: MeasurementEntry = {
          id: Math.random().toString(36).substring(7),
          chest,
          waist,
          arms,
          thighs,
          date: Date.now(),
        };

        // Optimistic UI Update
        set((state) => ({
          measurements: [...state.measurements, localEntry].sort((a, b) => a.date - b.date),
        }));

        if (!token) return;

        try {
          await fetch(`${API_URL}/analytics/measurements`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ chest, waist, arms, thighs, date: localEntry.date }),
          });
          get().syncAnalytics();
        } catch (e) {
          console.warn('Offline: Logged measurements locally only.');
        }
      },
    }),
    {
      name: 'gymvault-analytics',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
