import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
} from 'react-native';
import { useWorkoutStore, Exercise } from '@/store/workout.store';
import { useTheme } from '@/hooks/use-theme';
import { TextInput } from '@/components/ui/TextInput';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Search, ChevronDown, ChevronUp } from 'lucide-react-native';

// Memoized Exercise Item for performance (List Performance Checklist)
const ExerciseRow = React.memo(({ exercise, theme }: { exercise: Exercise; theme: any }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.headerPressable}>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {exercise.primaryMuscle}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {exercise.category}
              </Text>
            </View>
          </View>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={theme.textSecondary} />
        ) : (
          <ChevronDown size={20} color={theme.textSecondary} />
        )}
      </Pressable>

      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: theme.backgroundSelected }]}>
          <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {exercise.description}
          </Text>
        </View>
      )}
    </Card>
  );
});

export default function ExercisesScreen() {
  const { exercises } = useWorkoutStore();
  const theme = useTheme();
  
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    exercises.forEach((ex) => groups.add(ex.primaryMuscle));
    return Array.from(groups);
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchesMuscle = selectedMuscle ? ex.primaryMuscle === selectedMuscle : true;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, search, selectedMuscle]);

  const renderItem = useCallback(({ item }: { item: Exercise }) => {
    return <ExerciseRow exercise={item} theme={theme} />;
  }, [theme]);

  const keyExtractor = useCallback((item: Exercise) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Exercises</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search exercise..."
          value={search}
          onChangeText={setSearch}
          icon={<Search size={20} color={theme.textSecondary} />}
        />
      </View>

      {/* Filter Horizontal Scroll */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={[null, ...muscleGroups]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedMuscle === item;
            return (
              <Pressable
                onPress={() => setSelectedMuscle(item)}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    {
                      color: isSelected ? theme.primaryText : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item === null ? 'All Muscles' : item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No exercises found matching filters.
            </Text>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  filtersWrapper: {
    height: 48,
    marginBottom: Spacing.two,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  filterBtnText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.three,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    gap: Spacing.one,
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.one,
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
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
});
