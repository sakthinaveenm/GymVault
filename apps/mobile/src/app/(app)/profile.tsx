import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Clipboard,
  Alert,
  Modal,
} from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useSettingsStore } from '@/store/settings.store';
import { useAnalyticsStore } from '@/store/analytics.store';
import { useNutritionStore } from '@/store/nutrition.store';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Spacing } from '@/constants/theme';
import { LogOut, Sun, Moon, Flame, Calendar, Dumbbell, Database, Share2, Upload, Download, Cloud } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, token, logout } = useAuthStore();
  const { history, routines, restoreWorkoutsBackup } = useWorkoutStore();
  const { weights, measurements, restoreAnalyticsBackup } = useAnalyticsStore();
  const { logs: nutritionLogs, goals: nutritionGoals, restoreNutritionBackup } = useNutritionStore();
  const { theme, setTheme, unitSystem, toggleUnitSystem } = useSettingsStore();
  const currentThemeColors = useTheme();

  // Restore backup state
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');

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

  // Backup & Export Handlers
  const handleExportCSV = () => {
    if (history.length === 0) {
      Alert.alert('No logs', 'You do not have any logged workouts to export.');
      return;
    }

    let csvContent = 'Date,Workout,Exercise,Category,Muscle Group,Set Index,Weight,Reps,Completed\n';

    history.forEach((workout) => {
      const dateString = new Date(workout.date).toISOString().split('T')[0];
      workout.exercises.forEach((ex) => {
        ex.sets.forEach((set, idx) => {
          csvContent += `"${dateString}","${workout.title.replace(/"/g, '""')}","${ex.name.replace(/"/g, '""')}","${ex.category}","${ex.primaryMuscle}",${idx + 1},${set.weight},${set.reps},${set.isCompleted}\n`;
        });
      });
    });

    Clipboard.setString(csvContent);
    Alert.alert('Export Complete', 'Workout history has been copied to your clipboard in CSV format!');
  };

  const handleBackupJSON = () => {
    const backupObj = {
      routines,
      history,
      weights,
      measurements,
      nutritionLogs,
      nutritionGoals,
    };

    Clipboard.setString(JSON.stringify(backupObj));
    Alert.alert('Backup Copied', 'Your backup JSON data has been copied to your clipboard. Store it safely!');
  };

  const handleRestoreJSON = () => {
    try {
      const parsed = JSON.parse(restoreInput);
      if (parsed.routines && parsed.history) {
        restoreWorkoutsBackup(parsed.routines, parsed.history);
        if (parsed.weights || parsed.measurements) {
          restoreAnalyticsBackup(parsed.weights || [], parsed.measurements || []);
        }
        if (parsed.nutritionLogs) {
          restoreNutritionBackup(parsed.nutritionLogs, parsed.nutritionGoals || { calories: 2000, protein: 150, carbs: 200, fat: 70 });
        }
        setRestoreModalVisible(false);
        setRestoreInput('');
        Alert.alert('Restore Successful', 'Your data backup has been successfully restored!');
      } else {
        Alert.alert('Invalid Data', 'The pasted backup data does not contain routines or history.');
      }
    } catch (e) {
      Alert.alert('Parse Error', 'Failed to parse the backup text. Make sure you copied the entire backup string.');
    }
  };

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
          <View style={styles.badgeContainer}>
            <View style={[styles.syncBadge, { backgroundColor: token ? '#30d15820' : '#ff950020' }]}>
              <Text style={[styles.syncBadgeText, { color: token ? '#30d158' : '#ff9500' }]}>
                {token ? 'Cloud Synced' : 'Local Storage'}
              </Text>
            </View>
          </View>
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
          <Dumbbell size={24} color="#0a84ff" />
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

      {/* Data & Backup Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentThemeColors.text }]}>Data & Backup</Text>
        
        <Card style={styles.settingsGroup}>
          <Pressable onPress={handleExportCSV} style={styles.settingsRow}>
            <View style={styles.settingsLabelCol}>
              <Text style={[styles.settingLabel, { color: currentThemeColors.text }]}>Export History (CSV)</Text>
              <Text style={[styles.settingSub, { color: currentThemeColors.textSecondary }]}>
                Export workouts as spreadsheet CSV
              </Text>
            </View>
            <Share2 size={18} color={currentThemeColors.textSecondary} />
          </Pressable>

          <Pressable onPress={handleBackupJSON} style={styles.settingsRow}>
            <View style={styles.settingsLabelCol}>
              <Text style={[styles.settingLabel, { color: currentThemeColors.text }]}>Backup Data (JSON)</Text>
              <Text style={[styles.settingSub, { color: currentThemeColors.textSecondary }]}>
                Copy portable backup string to clipboard
              </Text>
            </View>
            <Download size={18} color={currentThemeColors.textSecondary} />
          </Pressable>

          <Pressable onPress={() => setRestoreModalVisible(true)} style={styles.settingsRow}>
            <View style={styles.settingsLabelCol}>
              <Text style={[styles.settingLabel, { color: currentThemeColors.text }]}>Restore Backup</Text>
              <Text style={[styles.settingSub, { color: currentThemeColors.textSecondary }]}>
                Import and restore data from clipboard backup
              </Text>
            </View>
            <Upload size={18} color={currentThemeColors.textSecondary} />
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

      {/* Restore Modal */}
      <Modal visible={restoreModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: currentThemeColors.background }]}>
            <Text style={[styles.modalTitle, { color: currentThemeColors.text }]}>Restore Backup</Text>
            <Text style={[styles.modalDesc, { color: currentThemeColors.textSecondary }]}>
              Paste your workout backup JSON text in the field below to restore your routines, weights, and logs.
            </Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                placeholder="Paste JSON text here..."
                value={restoreInput}
                onChangeText={setRestoreInput}
                multiline
                numberOfLines={6}
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setRestoreModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: currentThemeColors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRestoreJSON} style={[styles.modalSubmit, { backgroundColor: currentThemeColors.primary }]}>
                <Text style={{ color: currentThemeColors.primaryText, fontWeight: '700' }}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  syncBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.three,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.one,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  settingsGroup: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsLabelCol: {
    gap: Spacing.half,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeOptions: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  optionBtn: {
    padding: 8,
    borderRadius: 6,
  },
  unitBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBody: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.four,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  modalInputWrapper: {
    marginBottom: Spacing.three,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  modalSubmit: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
});
