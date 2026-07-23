import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './index';

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

// Hardcoded Exercise Database
export const EXERCISE_DATABASE: Exercise[] = [
  { id: '1', name: 'Barbell Bench Press', category: 'Barbell', primaryMuscle: 'Chest', description: 'Lie on a flat bench, grip the barbell slightly wider than shoulder-width, lower it to your chest, and press up.' },
  { id: '2', name: 'Dumbbell Incline Press', category: 'Dumbbell', primaryMuscle: 'Chest', description: 'Sit on an incline bench, press dumbbells upwards from shoulder height.' },
  { id: '3', name: 'Barbell Squat', category: 'Barbell', primaryMuscle: 'Legs', description: 'Rest barbell on traps, bend knees and hips to squat down, keep chest up, and stand back up.' },
  { id: '4', name: 'Barbell Deadlift', category: 'Barbell', primaryMuscle: 'Back', description: 'Lift barbell from the ground to hip level, keeping your back straight and engaging glutes/hamstrings.' },
  { id: '5', name: 'Overhead Press', category: 'Barbell', primaryMuscle: 'Shoulders', description: 'Press barbell overhead from collarbone level while standing.' },
  { id: '6', name: 'Pull Up', category: 'Bodyweight', primaryMuscle: 'Back', description: 'Hang from a bar and pull your chest to the bar using your back and biceps.' },
  { id: '7', name: 'Dumbbell Bicep Curl', category: 'Dumbbell', primaryMuscle: 'Arms', description: 'Hold dumbbells by sides and curl them upwards while keeping elbows pinned.' },
  { id: '8', name: 'Cable Tricep Pushdown', category: 'Machine', primaryMuscle: 'Arms', description: 'Push cable attachment downwards by extending elbows.' },
  { id: '9', name: 'Dumbbell Lateral Raise', category: 'Dumbbell', primaryMuscle: 'Shoulders', description: 'Raise dumbbells outwards to the sides to shoulder height.' },
  { id: '10', name: 'Lying Leg Curl', category: 'Machine', primaryMuscle: 'Legs', description: 'Lie face down and curl the leg roller towards glutes.' },
  { id: '11', name: 'Leg Extension', category: 'Machine', primaryMuscle: 'Legs', description: 'Sit and extend knees to lift the roller pad.' },
  { id: '12', name: 'Plank', category: 'Bodyweight', primaryMuscle: 'Core', description: 'Hold a push-up position resting on forearms, maintaining a straight line.' },
  { id: '13', name: 'Cable Seated Row', category: 'Machine', primaryMuscle: 'Back', description: 'Sit at cable station and pull handle towards lower abdomen.' },
  { id: '14', name: 'Push Up', category: 'Bodyweight', primaryMuscle: 'Chest', description: 'Classic push-up from the floor keeping body straight.' },
];

interface WorkoutState {
  routines: Routine[];
  history: LoggedWorkout[];
  activeWorkout: ActiveWorkout | null;
  exercises: Exercise[];
  
  // Routine actions
  createRoutine: (title: string, exercises: WorkoutExercise[]) => void;
  deleteRoutine: (id: string) => void;

  // Active workout actions
  startWorkout: (routineId?: string) => void;
  updateActiveTimer: () => void;
  addExerciseToActiveWorkout: (exercise: Exercise) => void;
  removeExerciseFromActiveWorkout: (exerciseId: string) => void;
  addSetToActiveExercise: (exerciseId: string) => void;
  removeSetFromActiveExercise: (exerciseId: string, setId: string) => void;
  updateActiveSet: (exerciseId: string, setId: string, fields: Partial<WorkoutSet>) => void;
  completeWorkout: () => void;
  cancelActiveWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      routines: [
        {
          id: 'default-push',
          title: 'Push Day',
          exercises: [
            {
              exerciseId: '1',
              name: 'Barbell Bench Press',
              category: 'Barbell',
              primaryMuscle: 'Chest',
              sets: [
                { id: 's1', weight: 60, reps: 10, isCompleted: false, type: 'normal' },
                { id: 's2', weight: 60, reps: 10, isCompleted: false, type: 'normal' },
                { id: 's3', weight: 65, reps: 8, isCompleted: false, type: 'normal' },
              ]
            },
            {
              exerciseId: '5',
              name: 'Overhead Press',
              category: 'Barbell',
              primaryMuscle: 'Shoulders',
              sets: [
                { id: 's4', weight: 40, reps: 8, isCompleted: false, type: 'normal' },
                { id: 's5', weight: 40, reps: 8, isCompleted: false, type: 'normal' },
              ]
            }
          ]
        }
      ],
      history: [],
      activeWorkout: null,
      exercises: EXERCISE_DATABASE,

      createRoutine: (title, exercises) => {
        const newRoutine: Routine = {
          id: Math.random().toString(36).substring(7),
          title: title || 'New Routine',
          exercises,
        };
        set((state) => ({ routines: [...state.routines, newRoutine] }));
      },

      deleteRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
      },

      startWorkout: (routineId) => {
        const state = get();
        if (state.activeWorkout) return; // Workout already active
        
        let initialExercises: WorkoutExercise[] = [];
        let title = 'Custom Workout';

        if (routineId) {
          const routine = state.routines.find((r) => r.id === routineId);
          if (routine) {
            title = routine.title;
            // Deep copy exercises and sets
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

        // Check if exercise already exists
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

      completeWorkout: () => {
        const active = get().activeWorkout;
        if (!active) return;

        // Save to history
        const logged: LoggedWorkout = {
          id: Math.random().toString(36).substring(7),
          title: active.title || 'Workout',
          date: Date.now(),
          durationSeconds: active.elapsedSeconds,
          exercises: active.exercises.filter((e) => e.sets.some((s) => s.isCompleted)),
        };

        // Only log if they completed at least one set
        if (logged.exercises.length > 0) {
          set((state) => ({
            history: [logged, ...state.history],
            activeWorkout: null,
          }));
        } else {
          set({ activeWorkout: null });
        }
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
