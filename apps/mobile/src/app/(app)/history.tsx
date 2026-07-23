import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
} from 'react-native';
import { useWorkoutStore, LoggedWorkout } from '@/store/workout.store';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Calendar, Clock, Award } from 'lucide-react-native';

const HistoryRow = React.memo(({ item, theme }: { item: LoggedWorkout; theme: any }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return '< 1m';
    return `${mins}m`;
  };

  const calculateTotalVolume = () => {
    let volume = 0;
    item.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.isCompleted) {
          volume += set.weight * set.reps;
        }
      });
    });
    return volume;
  };

  const totalVolume = calculateTotalVolume();

  return (
    <Card style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <View style={styles.titleCol}>
          <Text style={[styles.workoutTitle, { color: theme.text }]}>{item.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaIconText}>
              <Calendar size={12} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {formatDate(item.date)}
              </Text>
            </View>
            <View style={styles.metaIconText}>
              <Clock size={12} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {formatDuration(item.durationSeconds)}
              </Text>
            </View>
          </View>
        </View>
        {totalVolume > 0 && (
          <View style={styles.volumeBadge}>
            <Award size={14} color={theme.primary} />
            <Text style={[styles.volumeText, { color: theme.primary }]}>
              {totalVolume} kg
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.exerciseList, { borderTopColor: theme.backgroundSelected }]}>
        {item.exercises.map((ex, idx) => (
          <View key={idx} style={styles.exerciseItem}>
            <Text style={[styles.exerciseName, { color: theme.text }]} numberOfLines={1}>
              {ex.name}
            </Text>
            <Text style={[styles.setDetail, { color: theme.textSecondary }]}>
              {ex.sets.length} set{ex.sets.length === 1 ? '' : 's'} •{' '}
              {ex.sets.map((s) => `${s.weight}kg x ${s.reps}`).join(', ')}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
});

export default function HistoryScreen() {
  const { history } = useWorkoutStore();
  const theme = useTheme();

  const renderItem = useCallback(({ item }: { item: LoggedWorkout }) => {
    return <HistoryRow item={item} theme={theme} />;
  }, [theme]);

  const keyExtractor = useCallback((item: LoggedWorkout) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>History</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Calendar size={36} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No workouts logged yet. Finish a workout to start building your history!
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
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  workoutCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    gap: Spacing.half,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  metaIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
    backgroundColor: '#30d15815',
  },
  volumeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseList: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  exerciseItem: {
    gap: Spacing.half,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
  },
  setDetail: {
    fontSize: 12,
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
});
