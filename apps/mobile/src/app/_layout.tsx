import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from 'expo-router/react-navigation';
import { useAuthStore } from '@/store/auth.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useSettingsStore } from '@/store/settings.store';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const { syncData } = useWorkoutStore();
  const segments = useSegments();
  const router = useRouter();

  // Hide splash screen once mounted
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Avoid running redirect logic on initial mount when segments might not be loaded yet
    if (segments.length === (0 as number)) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth screens
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to app if authenticated and in auth screens
      router.replace('/(app)');
    }
  }, [user, segments]);

  useEffect(() => {
    // Sync data (exercises, routines, history) from backend API
    syncData();
    // Sync analytics (weights, measurements, PRs)
    const { syncAnalytics } = require('@/store/analytics.store').useAnalyticsStore.getState();
    syncAnalytics();
    // Sync nutrition logs & goals
    try {
      const { syncNutrition } = require('@/store/nutrition.store').useNutritionStore.getState();
      syncNutrition();
    } catch (e) {
      console.warn('Failed to require nutrition store for sync.');
    }
  }, [user]);

  const navTheme = theme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </ThemeProvider>
  );
}
