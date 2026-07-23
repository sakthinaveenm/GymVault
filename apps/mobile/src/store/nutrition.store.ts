import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';
import { useAuthStore } from './auth.store';
import { API_URL } from '@/constants/api';

export interface MealLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface NutritionLog {
  id?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: number; // UTC midnight timestamp
  meals: MealLog[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionState {
  logs: NutritionLog[];
  goals: NutritionGoals;
  isLoading: boolean;

  syncNutrition: () => Promise<void>;
  logMeal: (name: string, calories: number, protein: number, carbs: number, fat: number) => Promise<void>;
  updateGoals: (calories: number, protein: number, carbs: number, fat: number) => Promise<void>;
  restoreNutritionBackup: (logs: NutritionLog[], goals: NutritionGoals) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      logs: [],
      goals: { calories: 2000, protein: 150, carbs: 200, fat: 70 },
      isLoading: false,

      syncNutrition: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ isLoading: true });
        try {
          // 1. Fetch Logs
          const logsRes = await fetch(`${API_URL}/nutrition`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const logsJson = await logsRes.json();
          if (logsJson.success) {
            set({ logs: logsJson.data });
          }

          // 2. Fetch Goals
          const goalsRes = await fetch(`${API_URL}/nutrition/goals`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const goalsJson = await goalsRes.json();
          if (goalsJson.success) {
            set({ goals: goalsJson.data });
          }
        } catch (e) {
          console.warn('Offline: Failed to sync nutrition data with server.');
        } finally {
          set({ isLoading: false });
        }
      },

      logMeal: async (name, calories, protein, carbs, fat) => {
        const token = useAuthStore.getState().token;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const midnightTimestamp = today.getTime();

        const newMeal: MealLog = {
          id: Math.random().toString(36).substring(7),
          name,
          calories,
          protein,
          carbs,
          fat,
          timestamp: Date.now(),
        };

        // Optimistic State Update
        set((state) => {
          const list = [...state.logs];
          const todayIndex = list.findIndex((l) => l.date === midnightTimestamp);

          if (todayIndex > -1) {
            const currentLog = { ...list[todayIndex] };
            currentLog.meals = [...currentLog.meals, newMeal];
            currentLog.calories += calories;
            currentLog.protein += protein;
            currentLog.carbs += carbs;
            currentLog.fat += fat;
            list[todayIndex] = currentLog;
          } else {
            list.unshift({
              date: midnightTimestamp,
              calories,
              protein,
              carbs,
              fat,
              meals: [newMeal],
            });
          }

          return { logs: list };
        });

        if (!token) return;

        try {
          await fetch(`${API_URL}/nutrition/meal`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, calories, protein, carbs, fat }),
          });
          get().syncNutrition();
        } catch (e) {
          console.warn('Offline: Logged meal locally only.');
        }
      },

      updateGoals: async (calories, protein, carbs, fat) => {
        const token = useAuthStore.getState().token;
        const newGoals = { calories, protein, carbs, fat };

        set({ goals: newGoals });

        if (!token) return;

        try {
          await fetch(`${API_URL}/nutrition/goals`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newGoals),
          });
          get().syncNutrition();
        } catch (e) {
          console.warn('Offline: Saved targets locally only.');
        }
      },

      restoreNutritionBackup: (logs, goals) => {
        set({ logs, goals });
      },
    }),
    {
      name: 'gymvault-nutrition',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
