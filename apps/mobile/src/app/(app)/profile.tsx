import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useSettingsStore } from '@/store/settings.store';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { LogOut, Sun, Moon, Sparkles, Flame, Calendar, Dumbbell } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { history } = useWorkoutStore();
  const { theme, setTheme, unitSystem, toggleUnitSystem } = useSettingsStore();
  const currentThemeColors = useTheme();

  const totalSets = history.reduce((acc, workout) => {
    return acc + workout.exercises.reduce((exAcc, ex) => exAcc + ex.sets.length, 0);
  }, 0);

  // Calculate Streak
  const getStreak = () => {
    if (history.length === 0) return 0;
    
    const dates = history
      .map((h) => {
        const d = new Date(h.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((val, idx, self) => self.indexOf(val) === idx)
      .sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneDay = 24 * 60 * 60 * 1000;

    let checkTime = today.getTime();
    
    if (dates[0] && (checkTime - dates[0]) > oneDay) {
      return 0; // Streak broken
    }

    for (let i = 0; i < dates.length; i++) {
      const diff = Math.abs(checkTime - dates[i]);
      if (diff === 0 || diff === oneDay) {
        streak++;
        checkTime = dates[i];
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentThemeColors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentThemeColors.text }]}>Profile</Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: currentThemeColors.primary }]}>
          <Text style={[styles.avatarText, { color: currentThemeColors.primaryText }]}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: currentThemeColors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: currentThemeColors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>
      </Card>

      {/* Streak & Achievements */}
      <View style={styles.statsRow}>
        <Card style={styles.statBox}>
          <Flame size={24} color={streak > 0 ? '#ff9500' : currentThemeColors.textSecondary} fill={streak > 0 ? '#ff9500' : 'transparent'} />
          <Text style={[styles.statValue, { color: currentThemeColors.text }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: currentThemeColors.textSecondary }]}>Day Streak</Text>
        </Card>
        
        <Card style={styles.statBox}>
          <Calendar size={24} color={currentThemeColors.primary} />
          <Text style={[styles.statValue, { color: currentThemeColors.text }]}>
            {history.length}
          </Text>
          <Text style={[styles.statLabel, { color: currentThemeColors.textSecondary }]}>Workouts</Text>
        </Card>

        <Card style={styles.statBox}>
          <Dumbbell size={24} color="#0A84FF" />
          <Text style={[styles.statValue, { color: currentThemeColors.text }]}>{totalSets}</Text>
          <Text style={[styles.statLabel, { color: currentThemeColors.textSecondary }]}>Total Sets</Text>
        </Card>
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentThemeColors.text }]}>App Settings</Text>
        
        <Card style={styles.settingsGroup}>
          {/* Theme Toggler */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsLabelCol}>
              <Text style={[styles.settingLabel, { color: currentThemeColors.text }]}>Theme</Text>
              <Text style={[styles.settingSub, { color: currentThemeColors.textSecondary }]}>
                Change app appearance
              </Text>
            </View>
            <View style={styles.themeOptions}>
              <Pressable
                onPress={() => setTheme('light')}
                style={[
                  styles.optionBtn,
                  theme === 'light' && { backgroundColor: currentThemeColors.primary + '20' },
                ]}
              >
                <Sun size={16} color={theme === 'light' ? currentThemeColors.primary : currentThemeColors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => setTheme('dark')}
                style={[
                  styles.optionBtn,
                  theme === 'dark' && { backgroundColor: currentThemeColors.primary + '20' },
                ]}
              >
                <Moon size={16} color={theme === 'dark' ? currentThemeColors.primary : currentThemeColors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Unit System */}
          <Pressable onPress={toggleUnitSystem} style={styles.settingsRow}>
            <View style={styles.settingsLabelCol}>
              <Text style={[styles.settingLabel, { color: currentThemeColors.text }]}>
                Weight Unit
              </Text>
              <Text style={[styles.settingSub, { color: currentThemeColors.textSecondary }]}>
                System units for tracking weight
              </Text>
            </View>
            <View style={[styles.unitBadge, { backgroundColor: currentThemeColors.backgroundSelected }]}>
              <Text style={[styles.unitText, { color: currentThemeColors.text }]}>
                {unitSystem === 'metric' ? 'kg' : 'lbs'}
              </Text>
            </View>
          </Pressable>
        </Card>
      </View>

      <Button
        title="Log Out"
        onPress={logout}
        variant="danger"
        icon={<LogOut size={20} color="#ffffff" />}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

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
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
  },
  userInfo: {
    gap: Spacing.half,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  settingsGroup: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#8e8e9320',
  },
  settingsLabelCol: {
    gap: Spacing.half,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  optionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8e8e9320',
  },
  unitBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    marginTop: Spacing.two,
  },
});
