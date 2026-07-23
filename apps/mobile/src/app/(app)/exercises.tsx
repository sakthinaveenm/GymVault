import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import { useWorkoutStore, Exercise } from '@/store/workout.store';
import { useTheme } from '@/hooks/use-theme';
import { TextInput } from '@/components/ui/TextInput';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Search, ChevronDown, ChevronUp, Star } from 'lucide-react-native';

// Memoized Exercise Item for performance
const ExerciseRow = React.memo(
  ({
    exercise,
    theme,
    isFavorite,
    onToggleFavorite,
  }: {
    exercise: Exercise;
    theme: any;
    isFavorite: boolean;
    onToggleFavorite: () => void;
  }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <Card style={styles.card}>
        <View style={styles.headerPressable}>
          <Pressable onPress={() => setExpanded(!expanded)} style={styles.exerciseInfo}>
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
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable onPress={onToggleFavorite} style={styles.starBtn}>
              <Star
                size={20}
                color={isFavorite ? '#ff9500' : theme.textSecondary}
                fill={isFavorite ? '#ff9500' : 'transparent'}
              />
            </Pressable>
            <Pressable onPress={() => setExpanded(!expanded)} style={styles.chevronBtn}>
              {expanded ? (
                <ChevronUp size={20} color={theme.textSecondary} />
              ) : (
                <ChevronDown size={20} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>
        </View>

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
  }
);

export default function ExercisesScreen() {
  const { exercises, favoriteExerciseIds, toggleFavoriteExercise } = useWorkoutStore();
  const theme = useTheme();
  
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    exercises.forEach((ex) => groups.add(ex.primaryMuscle));
    return Array.from(groups);
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchesMuscle = selectedMuscle ? ex.primaryMuscle === selectedMuscle : true;
      const matchesFavorites = showFavoritesOnly ? favoriteExerciseIds.includes(ex.id) : true;
      return matchesSearch && matchesMuscle && matchesFavorites;
    });
  }, [exercises, search, selectedMuscle, showFavoritesOnly, favoriteExerciseIds]);

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => {
      const isFav = favoriteExerciseIds.includes(item.id);
      return (
        <ExerciseRow
          exercise={item}
          theme={theme}
          isFavorite={isFav}
          onToggleFavorite={() => toggleFavoriteExercise(item.id)}
        />
      );
    },
    [theme, favoriteExerciseIds, toggleFavoriteExercise]
  );

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <Pressable
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: showFavoritesOnly ? '#ff9500' : theme.backgroundSelected,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              },
            ]}
          >
            <Star
              size={14}
              color={showFavoritesOnly ? '#fff' : theme.text}
              fill={showFavoritesOnly ? '#fff' : 'transparent'}
            />
            <Text
              style={[
                styles.filterBtnText,
                {
                  color: showFavoritesOnly ? '#fff' : theme.text,
                  fontWeight: '700',
                },
              ]}
            >
              Favorites
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedMuscle(null)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: selectedMuscle === null ? theme.primary : theme.backgroundSelected,
              },
            ]}
          >
            <Text
              style={[
                styles.filterBtnText,
                {
                  color: selectedMuscle === null ? theme.primaryText : theme.text,
                  fontWeight: selectedMuscle === null ? '700' : '500',
                },
              ]}
            >
              All Muscles
            </Text>
          </Pressable>

          {muscleGroups.map((muscle) => {
            const isSelected = selectedMuscle === muscle;
            return (
              <Pressable
                key={muscle}
                onPress={() => setSelectedMuscle(muscle)}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundSelected,
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
                  {muscle}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  starBtn: {
    padding: Spacing.one,
  },
  chevronBtn: {
    padding: Spacing.one,
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
