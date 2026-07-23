import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useWorkoutStore, Routine } from '@/store/workout.store';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Dumbbell, Plus, Play, Trash2, Copy } from 'lucide-react-native';

export default function WorkoutDashboard() {
  const { user } = useAuthStore();
  const { routines, activeWorkout, startWorkout, deleteRoutine, duplicateRoutine } = useWorkoutStore();
  const theme = useTheme();
  const router = useRouter();

  const handleStartEmpty = () => {
    startWorkout();
    router.push('/workout-active');
  };

  const handleStartRoutine = (id: string) => {
    startWorkout(id);
    router.push('/workout-active');
  };

  const confirmDeleteRoutine = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`Delete routine "${title}"?`)) {
        deleteRoutine(id);
      }
      return;
    }
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete the routine "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(id) },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.welcome, { color: theme.textSecondary }]}>
          HELLO, {user?.name?.toUpperCase() || 'CHAMP'} 👋
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>Start Workout</Text>
      </View>

      {activeWorkout && (
        <Card
          onPress={() => router.push('/workout-active')}
          style={[styles.activeWorkoutCard, { borderColor: theme.primary, borderWidth: 1 }]}
        >
          <View style={styles.activeRow}>
            <View style={styles.activeLabelContainer}>
              <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
              <Text style={[styles.activeTitle, { color: theme.text }]}>
                Workout in Progress
              </Text>
            </View>
            <Text style={[styles.activeDuration, { color: theme.primary }]}>
              {Math.floor(activeWorkout.elapsedSeconds / 60)}m active
            </Text>
          </View>
          <Text style={[styles.activeSubtitle, { color: theme.textSecondary }]}>
            Tap to resume tracking your active sets.
          </Text>
        </Card>
      )}

      <View style={styles.quickStart}>
        <Button
          title="Start Empty Workout"
          onPress={handleStartEmpty}
          icon={<Plus size={20} color={theme.primaryText} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Routines</Text>
        
        {routines.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Dumbbell size={36} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No routines saved. Create one below or start an empty workout.
            </Text>
          </Card>
        ) : (
          routines.map((routine) => (
            <Card key={routine.id} style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <Text style={[styles.routineTitle, { color: theme.text }]}>
                  {routine.title}
                </Text>
                <View style={styles.routineActions}>
                  <Pressable
                    onPress={() => handleStartRoutine(routine.id)}
                    style={({ pressed }) => [
                      styles.actionIcon,
                      { backgroundColor: theme.primary + '15' },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Play size={18} color={theme.primary} fill={theme.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => duplicateRoutine(routine.id)}
                    style={({ pressed }) => [
                      styles.actionIcon,
                      { backgroundColor: theme.backgroundSelected },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Copy size={16} color={theme.text} />
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDeleteRoutine(routine.id, routine.title)}
                    style={({ pressed }) => [
                      styles.actionIcon,
                      { backgroundColor: '#ff453a15' },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Trash2 size={18} color="#ff453a" />
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.exerciseCount, { color: theme.textSecondary }]}>
                {routine.exercises.length} Exercise{routine.exercises.length === 1 ? '' : 's'}
              </Text>
              
              <View style={styles.exercisePreview}>
                {routine.exercises.slice(0, 3).map((ex, index) => (
                  <Text key={index} style={[styles.previewItem, { color: theme.textSecondary }]} numberOfLines={1}>
                    • {ex.name} ({ex.sets.length} sets)
                  </Text>
                ))}
                {routine.exercises.length > 3 && (
                  <Text style={[styles.previewItem, { color: theme.textSecondary }]}>
                    + {routine.exercises.length - 3} more...
                  </Text>
                )}
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Check Platform for compatibility
const Platform = { OS: 'ios' };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  welcome: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  activeWorkoutCard: {
    gap: Spacing.one,
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeDuration: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeSubtitle: {
    fontSize: 13,
  },
  quickStart: {
    marginTop: Spacing.one,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.three,
  },
  routineCard: {
    gap: Spacing.two,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  routineActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  exercisePreview: {
    gap: Spacing.half,
    marginTop: Spacing.one,
  },
  previewItem: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
