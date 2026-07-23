import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput as RNTextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore, Exercise } from '@/store/workout.store';
import { useSettingsStore } from '@/store/settings.store';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Clock, Plus, Trash2, Check, X, Search } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { RestTimer } from '@/components/RestTimer';

export default function ActiveWorkoutScreen() {
  const {
    activeWorkout,
    exercises,
    updateActiveTimer,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    addSetToActiveExercise,
    removeSetFromActiveExercise,
    updateActiveSet,
    completeWorkout,
    cancelActiveWorkout,
  } = useWorkoutStore();
  
  const { unitSystem } = useSettingsStore();
  const theme = useTheme();
  const router = useRouter();

  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [restTimerVisible, setRestTimerVisible] = useState(false);

  const handleToggleComplete = (exerciseId: string, setId: string, currentlyCompleted: boolean) => {
    const nextCompleted = !currentlyCompleted;
    updateActiveSet(exerciseId, setId, { isCompleted: nextCompleted });
    if (nextCompleted) {
      setRestTimerVisible(true);
    }
  };

  // Active workout timer tick
  useEffect(() => {
    if (!activeWorkout) {
      router.replace('/(app)');
      return;
    }
    const interval = setInterval(() => {
      updateActiveTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout) {
    return null;
  }

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleCancelWorkout = () => {
    const cancel = () => {
      cancelActiveWorkout();
      router.replace('/(app)');
    };

    if (Platform.OS === 'web') {
      if (confirm('Discard this workout? All progress will be lost.')) {
        cancel();
      }
      return;
    }

    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: cancel },
      ]
    );
  };

  const handleCompleteWorkout = () => {
    const totalCompletedSets = activeWorkout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.filter((s) => s.isCompleted).length;
    }, 0);

    if (totalCompletedSets === 0) {
      if (Platform.OS === 'web') {
        alert('Please complete at least one set before saving.');
        return;
      }
      Alert.alert('Empty Workout', 'Please check/complete at least one set before saving.');
      return;
    }

    completeWorkout();
    router.replace('/(app)');
  };

  const handleAddExercise = (exercise: Exercise) => {
    addExerciseToActiveWorkout(exercise);
    setExerciseModalVisible(false);
    setSearchQuery('');
  };

  const filteredExercises = exercises.filter((ex: Exercise) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const alreadyAdded = activeWorkout.exercises.some((e) => e.exerciseId === ex.id);
    return matchesSearch && !alreadyAdded;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Panel */}
      <View style={[styles.header, { borderBottomColor: theme.backgroundSelected }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.workoutTitle, { color: theme.text }]}>{activeWorkout.title}</Text>
          <View style={styles.timerRow}>
            <Clock size={16} color={theme.primary} />
            <Text style={[styles.timerText, { color: theme.primary }]}>
              {formatTimer(activeWorkout.elapsedSeconds)}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleCancelWorkout}
            style={[styles.closeBtn, { backgroundColor: theme.backgroundElement }]}
          >
            <X size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeWorkout.exercises.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No exercises added. Tap "Add Exercise" to get started.
            </Text>
          </Card>
        ) : (
          activeWorkout.exercises.map((ex) => (
            <Card key={ex.exerciseId} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View>
                  <Text style={[styles.exerciseName, { color: theme.text }]}>{ex.name}</Text>
                  <Text style={[styles.exerciseMuscle, { color: theme.textSecondary }]}>
                    {ex.primaryMuscle} • {ex.category}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeExerciseFromActiveWorkout(ex.exerciseId)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Trash2 size={18} color="#ff453a" />
                </Pressable>
              </View>

              {/* Sets Table */}
              <View style={styles.setsTable}>
                {/* Column Headers */}
                <View style={styles.setsTableHeader}>
                  <Text style={[styles.colHeader, styles.colIndex, { color: theme.textSecondary }]}>Set</Text>
                  <Text style={[styles.colHeader, styles.colInput, { color: theme.textSecondary }]}>
                    {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </Text>
                  <Text style={[styles.colHeader, styles.colInput, { color: theme.textSecondary }]}>Reps</Text>
                  <Text style={[styles.colHeader, styles.colCheck, { color: theme.textSecondary }]}></Text>
                </View>

                {/* Set Rows */}
                {ex.sets.map((set, index) => (
                  <View
                    key={set.id}
                    style={[
                      styles.setRow,
                      set.isCompleted && { backgroundColor: theme.primary + '10' },
                    ]}
                  >
                    <Text style={[styles.setIndex, { color: theme.text }]}>{index + 1}</Text>
                    
                    {/* Weight Input */}
                    <RNTextInput
                      keyboardType="numeric"
                      value={set.weight ? set.weight.toString() : ''}
                      onChangeText={(val) =>
                        updateActiveSet(ex.exerciseId, set.id, { weight: parseFloat(val) || 0 })
                      }
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary + '60'}
                      style={[
                        styles.setInput,
                        {
                          backgroundColor: theme.backgroundSelected,
                          color: theme.text,
                        },
                      ]}
                    />

                    {/* Reps Input */}
                    <RNTextInput
                      keyboardType="numeric"
                      value={set.reps ? set.reps.toString() : ''}
                      onChangeText={(val) =>
                        updateActiveSet(ex.exerciseId, set.id, { reps: parseInt(val) || 0 })
                      }
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary + '60'}
                      style={[
                        styles.setInput,
                        {
                          backgroundColor: theme.backgroundSelected,
                          color: theme.text,
                        },
                      ]}
                    />

                    {/* Check complete */}
                    <View style={styles.setRowActions}>
                      <Pressable
                        onPress={() =>
                          handleToggleComplete(ex.exerciseId, set.id, set.isCompleted)
                        }
                        style={[
                          styles.checkBtn,
                          {
                            backgroundColor: set.isCompleted
                              ? theme.primary
                              : theme.backgroundSelected,
                          },
                        ]}
                      >
                        <Check
                          size={16}
                          color={set.isCompleted ? theme.primaryText : theme.textSecondary}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => removeSetFromActiveExercise(ex.exerciseId, set.id)}
                        style={styles.deleteSetBtn}
                      >
                        <X size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              <Button
                title="Add Set"
                onPress={() => addSetToActiveExercise(ex.exerciseId)}
                variant="secondary"
                size="small"
                icon={<Plus size={16} color={theme.text} />}
                style={styles.addSetBtn}
              />
            </Card>
          ))
        )}

        {/* Footer actions inside scroll */}
        <View style={styles.footerActions}>
          <Button
            title="Add Exercise"
            onPress={() => setExerciseModalVisible(true)}
            variant="outline"
          />
          <Button title="Finish Workout" onPress={handleCompleteWorkout} />
        </View>
      </ScrollView>

      {/* Add Exercise Modal Sheet */}
      <Modal
        visible={exerciseModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Exercise</Text>
            <Pressable onPress={() => setExerciseModalVisible(false)}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.modalSearch}>
            <TextInput
              placeholder="Search exercise..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon={<Search size={20} color={theme.textSecondary} />}
            />
          </View>

          <ScrollView style={styles.modalList}>
            {filteredExercises.map((ex: Exercise) => (
              <Pressable
                key={ex.id}
                onPress={() => handleAddExercise(ex)}
                style={({ pressed }) => [
                  styles.modalItem,
                  { borderBottomColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.modalItemInfo}>
                  <Text style={[styles.modalItemName, { color: theme.text }]}>{ex.name}</Text>
                  <Text style={[styles.modalItemSub, { color: theme.textSecondary }]}>
                    {ex.primaryMuscle} • {ex.category}
                  </Text>
                </View>
                <Plus size={20} color={theme.primary} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <RestTimer isVisible={restTimerVisible} onClose={() => setRestTimerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerInfo: {
    gap: Spacing.half,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  exerciseCard: {
    gap: Spacing.three,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseMuscle: {
    fontSize: 12,
    fontWeight: '500',
  },
  setsTable: {
    gap: Spacing.two,
  },
  setsTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  colIndex: {
    width: 30,
    textAlign: 'left',
  },
  colInput: {
    flex: 1,
  },
  colCheck: {
    width: 68,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
  },
  setIndex: {
    width: 30,
    fontWeight: '600',
    fontSize: 14,
  },
  setInput: {
    flex: 1,
    height: 36,
    borderRadius: Spacing.two,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: Spacing.one,
  },
  setRowActions: {
    width: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.one,
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSetBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetBtn: {
    marginTop: Spacing.one,
  },
  footerActions: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#8e8e9320',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSearch: {
    padding: Spacing.four,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  modalItemInfo: {
    gap: Spacing.half,
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemSub: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
