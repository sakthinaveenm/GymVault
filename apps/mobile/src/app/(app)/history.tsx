import React, { useCallback, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
} from 'react-native';
import { useWorkoutStore, LoggedWorkout } from '@/store/workout.store';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Calendar as CalendarIcon, Clock, Award, ChevronLeft, ChevronRight, Copy } from 'lucide-react-native';

const HistoryRow = React.memo(
  ({
    item,
    theme,
    onDuplicate,
  }: {
    item: LoggedWorkout;
    theme: any;
    onDuplicate: (id: string) => void;
  }) => {
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
                <CalendarIcon size={12} color={theme.textSecondary} />
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

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => onDuplicate(item.id)}
              style={({ pressed }) => [
                styles.duplicateBtn,
                { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
            >
              <Copy size={12} color={theme.text} />
              <Text style={[styles.duplicateText, { color: theme.text }]}>Copy</Text>
            </Pressable>
            {totalVolume > 0 && (
              <View style={styles.volumeBadge}>
                <Award size={14} color={theme.primary} />
                <Text style={[styles.volumeText, { color: theme.primary }]}>
                  {totalVolume} kg
                </Text>
              </View>
            )}
          </View>
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
  }
);

export default function HistoryScreen() {
  const { history, duplicateLoggedWorkout } = useWorkoutStore();
  const theme = useTheme();

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  const hasWorkoutOnDay = useCallback(
    (date: Date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return history.some((w) => w.date >= start.getTime() && w.date <= end.getTime());
    },
    [history]
  );

  const handleDayPress = (date: Date | null) => {
    if (!date) return;
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      setSelectedDate(null); // Deselect
    } else {
      setSelectedDate(date); // Select
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return history.filter((w) => w.date >= start.getTime() && w.date <= end.getTime());
  }, [history, selectedDate]);

  const renderItem = useCallback(
    ({ item }: { item: LoggedWorkout }) => {
      return (
        <HistoryRow
          item={item}
          theme={theme}
          onDuplicate={(id) => {
            duplicateLoggedWorkout(id);
          }}
        />
      );
    },
    [theme, duplicateLoggedWorkout]
  );

  const keyExtractor = useCallback((item: LoggedWorkout) => item.id, []);

  // Calendar Header rendering week labels
  const renderCalendar = () => {
    return (
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.text} />
          </Pressable>
          <Text style={[styles.monthTitle, { color: theme.text }]}>
            {monthNames[month]} {year}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <Text key={idx} style={[styles.weekDayText, { color: theme.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => {
            if (!day) {
              return <View key={index} style={styles.dayBox} />;
            }

            const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
            const hasWorkout = hasWorkoutOnDay(day);

            return (
              <Pressable
                key={index}
                onPress={() => handleDayPress(day)}
                style={styles.dayBox}
              >
                <View
                  style={[
                    styles.dayCircle,
                    isSelected && { backgroundColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isSelected ? theme.primaryText : theme.text },
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </View>
                {hasWorkout && (
                  <View
                    style={[
                      styles.workoutDot,
                      { backgroundColor: isSelected ? theme.primaryText : theme.primary },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>History</Text>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderCalendar()}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <CalendarIcon size={36} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {selectedDate
                ? 'No workouts logged on this day.'
                : 'No workouts logged yet. Finish a workout to start building your history!'}
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
  calendarCard: {
    padding: Spacing.three,
    marginBottom: Spacing.one,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  navBtn: {
    padding: Spacing.one,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  weekDayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBox: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
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
  headerActions: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  duplicateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  duplicateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
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
