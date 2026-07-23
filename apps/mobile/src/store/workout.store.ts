import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';
import { useAuthStore } from './auth.store';
import { API_URL } from '@/constants/api';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  primaryMuscle: string;
  description: string;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  isCompleted: boolean;
  type: 'normal' | 'warmup' | 'dropset';
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  category: string;
  primaryMuscle: string;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  title: string;
  startTime: number;
  elapsedSeconds: number;
  exercises: WorkoutExercise[];
}

export interface Routine {
  id: string;
  title: string;
  exercises: WorkoutExercise[];
}

export interface LoggedWorkout {
  id: string;
  title: string;
  date: number;
  durationSeconds: number;
  exercises: WorkoutExercise[];
}

// Local Exercise Database fallback (when server is offline)
export const OFFLINE_EXERCISES: Exercise[] = [
  { id: '1', name: 'Barbell Bench Press', category: 'Barbell', primaryMuscle: 'Chest', description: 'Lie on a flat bench, grip the barbell slightly wider than shoulder-width, lower it to your chest, and press up.' },
  { id: '2', name: 'Dumbbell Incline Press', category: 'Dumbbell', primaryMuscle: 'Chest', description: 'Sit on an incline bench, press dumbbells upwards from shoulder height.' },
  { id: '3', name: 'Barbell Squat', category: 'Barbell', primaryMuscle: 'Legs', description: 'Rest barbell on traps, bend knees and hips to squat down, keep chest up, and stand back up.' },
  { id: '4', name: 'Barbell Deadlift', category: 'Barbell', primaryMuscle: 'Back', description: 'Lift barbell from the ground to hip level, keeping your back straight and engaging glutes/hamstrings.' },
  { id: '5', name: 'Overhead Press', category: 'Barbell', primaryMuscle: 'Shoulders', description: 'Press barbell overhead from collarbone level while standing.' },
];

interface WorkoutState {
  routines: Routine[];
  history: LoggedWorkout[];
  activeWorkout: ActiveWorkout | null;
  exercises: Exercise[];
  favoriteExerciseIds: string[];
  
  // Sync
  syncData: () => Promise<void>;

  // Favorites
  toggleFavoriteExercise: (id: string) => Promise<void>;

  // Duplication
  duplicateRoutine: (id: string) => Promise<void>;
  duplicateLoggedWorkout: (id: string) => Promise<void>;

  // Routine actions
  createRoutine: (title: string, exercises: WorkoutExercise[]) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;

  // Active workout actions
  startWorkout: (routineId?: string) => void;
  updateActiveTimer: () => void;
  addExerciseToActiveWorkout: (exercise: Exercise) => void;
  removeExerciseFromActiveWorkout: (exerciseId: string) => void;
  addSetToActiveExercise: (exerciseId: string) => void;
  removeSetFromActiveExercise: (exerciseId: string, setId: string) => void;
  updateActiveSet: (exerciseId: string, setId: string, fields: Partial<WorkoutSet>) => void;
  completeWorkout: () => Promise<void>;
  cancelActiveWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      routines: [],
      history: [],
      activeWorkout: null,
      exercises: OFFLINE_EXERCISES,
      favoriteExerciseIds: [],

      syncData: async () => {
        const token = useAuthStore.getState().token;
        
        // Always try to load seeded exercises first
        try {
          const exRes = await fetch(`${API_URL}/exercises`);
          const exJson = await exRes.json();
          if (exJson.success) {
            set({ exercises: exJson.data });
          }
        } catch (e) {
          console.warn('Offline: Failed to fetch online exercise database. Using local cache.');
        }

        if (!token) return;

        try {
          // Fetch Favorites
          const fRes = await fetch(`${API_URL}/auth/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fJson = await fRes.json();
          if (fJson.success) {
            set({ favoriteExerciseIds: fJson.data });
          }

          // Fetch Routines
          const rRes = await fetch(`${API_URL}/routines`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const rJson = await rRes.json();
          if (rJson.success) {
            set({ routines: rJson.data });
          }

          // Fetch History
          const hRes = await fetch(`${API_URL}/history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const hJson = await hRes.json();
          if (hJson.success) {
            set({ history: hJson.data });
          }
        } catch (e) {
          console.warn('Sync failed. Displaying offline cached workout logs.');
        }
      },

      createRoutine: async (title, exercises) => {
        const token = useAuthStore.getState().token;
        const newRoutineLocal: Routine = {
          id: Math.random().toString(36).substring(7),
          title: title || 'New Routine',
          exercises,
        };

        // Optimistic UI update
        set((state) => ({ routines: [...state.routines, newRoutineLocal] }));

        if (!token) return;

        try {
          await fetch(`${API_URL}/routines`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, exercises }),
          });
          get().syncData();
        } catch (e) {
          console.warn('Offline: saved routine locally only.');
        }
      },

      deleteRoutine: async (id) => {
        const token = useAuthStore.getState().token;
        
        // Optimistic UI update
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));

        if (!token) return;

        try {
          await fetch(`${API_URL}/routines/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.warn('Offline: removed routine locally only.');
        }
      },

      startWorkout: (routineId) => {
        const state = get();
        if (state.activeWorkout) return;
        
        let initialExercises: WorkoutExercise[] = [];
        let title = 'Custom Workout';

        if (routineId) {
          const routine = state.routines.find((r) => r.id === routineId);
          if (routine) {
            title = routine.title;
            initialExercises = routine.exercises.map((e) => ({
              ...e,
              sets: e.sets.map((s) => ({ ...s, isCompleted: false })),
            }));
          }
        }

        set({
          activeWorkout: {
            title,
            startTime: Date.now(),
            elapsedSeconds: 0,
            exercises: initialExercises,
          },
        });
      },

      updateActiveTimer: () => {
        const active = get().activeWorkout;
        if (!active) return;
        set({
          activeWorkout: {
            ...active,
            elapsedSeconds: Math.floor((Date.now() - active.startTime) / 1000),
          },
        });
      },

      addExerciseToActiveWorkout: (exercise) => {
        const active = get().activeWorkout;
        if (!active) return;

        const exists = active.exercises.some((e) => e.exerciseId === exercise.id);
        if (exists) return;

        const newWorkoutExercise: WorkoutExercise = {
          exerciseId: exercise.id,
          name: exercise.name,
          category: exercise.category,
          primaryMuscle: exercise.primaryMuscle,
          sets: [
            { id: Math.random().toString(36).substring(7), weight: 0, reps: 0, isCompleted: false, type: 'normal' }
          ],
        };

        set({
          activeWorkout: {
            ...active,
            exercises: [...active.exercises, newWorkoutExercise],
          },
        });
      },

      removeExerciseFromActiveWorkout: (exerciseId) => {
        const active = get().activeWorkout;
        if (!active) return;
        set({
          activeWorkout: {
            ...active,
            exercises: active.exercises.filter((e) => e.exerciseId !== exerciseId),
          },
        });
      },

      addSetToActiveExercise: (exerciseId) => {
        const active = get().activeWorkout;
        if (!active) return;

        const updatedExercises = active.exercises.map((e) => {
          if (e.exerciseId === exerciseId) {
            const lastSet = e.sets[e.sets.length - 1];
            const newSet: WorkoutSet = {
              id: Math.random().toString(36).substring(7),
              weight: lastSet ? lastSet.weight : 0,
              reps: lastSet ? lastSet.reps : 0,
              isCompleted: false,
              type: 'normal',
            };
            return {
              ...e,
              sets: [...e.sets, newSet],
            };
          }
          return e;
        });

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises,
          },
        });
      },

      removeSetFromActiveExercise: (exerciseId, setId) => {
        const active = get().activeWorkout;
        if (!active) return;

        const updatedExercises = active.exercises.map((e) => {
          if (e.exerciseId === exerciseId) {
            return {
              ...e,
              sets: e.sets.filter((s) => s.id !== setId),
            };
          }
          return e;
        });

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises,
          },
        });
      },

      updateActiveSet: (exerciseId, setId, fields) => {
        const active = get().activeWorkout;
        if (!active) return;

        const updatedExercises = active.exercises.map((e) => {
          if (e.exerciseId === exerciseId) {
            return {
              ...e,
              sets: e.sets.map((s) => {
                if (s.id === setId) {
                  return { ...s, ...fields };
                }
                return s;
              }),
            };
          }
          return e;
        });

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises,
          },
        });
      },

      completeWorkout: async () => {
        const active = get().activeWorkout;
        if (!active) return;

        const token = useAuthStore.getState().token;
        const loggedLocal: LoggedWorkout = {
          id: Math.random().toString(36).substring(7),
          title: active.title || 'Workout',
          date: Date.now(),
          durationSeconds: active.elapsedSeconds,
          exercises: active.exercises.filter((e) => e.sets.some((s) => s.isCompleted)),
        };

        if (loggedLocal.exercises.length === 0) {
          set({ activeWorkout: null });
          return;
        }

        // Optimistic UI update
        set((state) => ({
          history: [loggedLocal, ...state.history],
          activeWorkout: null,
        }));

        if (!token) return;

        try {
          await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: loggedLocal.title,
              date: loggedLocal.date,
              durationSeconds: loggedLocal.durationSeconds,
              exercises: loggedLocal.exercises,
            }),
          });
          get().syncData();
        } catch (e) {
          console.warn('Offline: logged workout locally only.');
        }
      },

      toggleFavoriteExercise: async (id) => {
        const token = useAuthStore.getState().token;
        set((state) => {
          const idx = state.favoriteExerciseIds.indexOf(id);
          const list = [...state.favoriteExerciseIds];
          if (idx > -1) {
            list.splice(idx, 1);
          } else {
            list.push(id);
          }
          return { favoriteExerciseIds: list };
        });

        if (!token) return;

        try {
          await fetch(`${API_URL}/auth/favorites/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.warn('Offline: toggled favorite locally only.');
        }
      },

      duplicateRoutine: async (id) => {
        const routine = get().routines.find((r) => r.id === id);
        if (!routine) return;
        await get().createRoutine(`${routine.title} (Copy)`, routine.exercises);
      },

      duplicateLoggedWorkout: async (id) => {
        const workout = get().history.find((w) => w.id === id);
        if (!workout) return;
        await get().createRoutine(
          `${workout.title} Template`,
          workout.exercises.map((e) => ({
            ...e,
            sets: e.sets.map((s) => ({ ...s, isCompleted: false })),
          }))
        );
      },

      cancelActiveWorkout: () => {
        set({ activeWorkout: null });
      },
    }),
    {
      name: 'gymvault-workouts',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
