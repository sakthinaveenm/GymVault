import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useAnalyticsStore } from '@/store/analytics.store';
import { useNutritionStore } from '@/store/nutrition.store';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { LineChart } from '@/components/ui/LineChart';
import { Spacing } from '@/constants/theme';
import { Flame, Trophy, Plus, Search, Calendar, ChevronRight, Activity, Utensils, Settings } from 'lucide-react-native';

type SubTab = 'weight' | 'nutrition' | 'measurements' | 'prs';
type MeasurementPart = 'arms' | 'chest' | 'waist' | 'thighs';

export default function AnalyticsScreen() {
  const { weights, measurements, prs, logWeight, logMeasurements } = useAnalyticsStore();
  const { logs: nutritionLogs, goals: nutritionGoals, logMeal, updateGoals } = useNutritionStore();
  const theme = useTheme();

  // Tab configurations
  const [activeTab, setActiveTab] = useState<SubTab>('weight');
  const [activePart, setActivePart] = useState<MeasurementPart>('arms');
  const [searchQuery, setSearchQuery] = useState('');

  // Log weight modal state
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState('');

  // Log measurements modal state
  const [measModalVisible, setMeasModalVisible] = useState(false);
  const [measChest, setMeasChest] = useState('');
  const [measWaist, setMeasWaist] = useState('');
  const [measArms, setMeasArms] = useState('');
  const [measThighs, setMeasThighs] = useState('');

  // Log Meal modal state
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealCal, setMealCal] = useState('');
  const [mealPro, setMealPro] = useState('');
  const [mealCarb, setMealCarb] = useState('');
  const [mealFat, setMealFat] = useState('');

  // Update Goals modal state
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [goalCal, setGoalCal] = useState(nutritionGoals.calories.toString());
  const [goalPro, setGoalPro] = useState(nutritionGoals.protein.toString());
  const [goalCarb, setGoalCarb] = useState(nutritionGoals.carbs.toString());
  const [goalFat, setGoalFat] = useState(nutritionGoals.fat.toString());

  // Formatted date helper
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  // 1. Weight calculations
  const weightChartData = useMemo(() => {
    return weights.map((w) => ({
      value: w.weight,
      label: formatDate(w.date),
    }));
  }, [weights]);

  const latestWeight = useMemo(() => {
    if (weights.length === 0) return null;
    return weights[weights.length - 1];
  }, [weights]);

  // 2. Measurements calculations
  const measurementChartData = useMemo(() => {
    return measurements.map((m) => ({
      value: m[activePart],
      label: formatDate(m.date),
    }));
  }, [measurements, activePart]);

  const latestMeasurement = useMemo(() => {
    if (measurements.length === 0) return null;
    return measurements[measurements.length - 1];
  }, [measurements]);

  // 3. PRs calculations
  const filteredPrs = useMemo(() => {
    return prs.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [prs, searchQuery]);

  // 4. Nutrition calculations
  const todayLog = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const midnightTimestamp = today.getTime();
    return (
      nutritionLogs.find((l) => l.date === midnightTimestamp) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        meals: [],
      }
    );
  }, [nutritionLogs]);

  const last7DaysCalories = useMemo(() => {
    const days = [];
    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const dateVal = now.getTime() - i * oneDay;
      const log = nutritionLogs.find((l) => l.date === dateVal);
      const dayName = new Date(dateVal).toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        dayName,
        calories: log ? log.calories : 0,
      });
    }
    return days;
  }, [nutritionLogs]);

  // Submit handlers
  const handleLogWeight = async () => {
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid positive weight value.');
      return;
    }
    await logWeight(val);
    setWeightModalVisible(false);
    setInputWeight('');
  };

  const handleLogMeasurements = async () => {
    const chestVal = parseFloat(measChest) || 0;
    const waistVal = parseFloat(measWaist) || 0;
    const armsVal = parseFloat(measArms) || 0;
    const thighsVal = parseFloat(measThighs) || 0;

    if (chestVal === 0 && waistVal === 0 && armsVal === 0 && thighsVal === 0) {
      Alert.alert('Empty input', 'Please enter at least one measurement value.');
      return;
    }

    await logMeasurements(chestVal, waistVal, armsVal, thighsVal);
    setMeasModalVisible(false);
    setMeasChest('');
    setMeasWaist('');
    setMeasArms('');
    setMeasThighs('');
  };

  const handleLogMeal = async () => {
    const calories = parseFloat(mealCal);
    const protein = parseFloat(mealPro) || 0;
    const carbs = parseFloat(mealCarb) || 0;
    const fat = parseFloat(mealFat) || 0;

    if (!mealName.trim()) {
      Alert.alert('Empty input', 'Please enter a food name.');
      return;
    }
    if (isNaN(calories) || calories < 0) {
      Alert.alert('Invalid input', 'Please enter valid calories.');
      return;
    }

    await logMeal(mealName, calories, protein, carbs, fat);
    setMealModalVisible(false);
    setMealName('');
    setMealCal('');
    setMealPro('');
    setMealCarb('');
    setMealFat('');
  };

  const handleUpdateGoals = async () => {
    const calories = parseFloat(goalCal);
    const protein = parseFloat(goalPro);
    const carbs = parseFloat(goalCarb);
    const fat = parseFloat(goalFat);

    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
      Alert.alert('Invalid input', 'Please enter positive numeric goal values.');
      return;
    }

    await updateGoals(calories, protein, carbs, fat);
    setGoalsModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: theme.backgroundSelected }]}>
        <Pressable
          onPress={() => setActiveTab('weight')}
          style={[styles.tabButton, activeTab === 'weight' && { borderBottomColor: theme.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'weight' ? theme.primary : theme.textSecondary }]}>
            Weight
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('nutrition')}
          style={[styles.tabButton, activeTab === 'nutrition' && { borderBottomColor: theme.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'nutrition' ? theme.primary : theme.textSecondary }]}>
            Nutrition
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('measurements')}
          style={[styles.tabButton, activeTab === 'measurements' && { borderBottomColor: theme.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'measurements' ? theme.primary : theme.textSecondary }]}>
            Size
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('prs')}
          style={[styles.tabButton, activeTab === 'prs' && { borderBottomColor: theme.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'prs' ? theme.primary : theme.textSecondary }]}>
            Records
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= tab: WEIGHT ================= */}
        {activeTab === 'weight' && (
          <View>
            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>LATEST BODY WEIGHT</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {latestWeight ? `${latestWeight.weight} kg` : '--'}
                </Text>
                {latestWeight && (
                  <Text style={[styles.summaryDate, { color: theme.textSecondary }]}>
                    Logged on {formatDate(latestWeight.date)}
                  </Text>
                )}
              </Card>
            </View>

            {weightChartData.length > 1 ? (
              <Card style={styles.chartCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Weight Trend (kg)</Text>
                <LineChart data={weightChartData} />
              </Card>
            ) : (
              <Card style={styles.emptyChartCard}>
                <Activity size={32} color={theme.textSecondary} />
                <Text style={[styles.emptyChartText, { color: theme.textSecondary }]}>
                  Need at least 2 logs to draw weight trends
                </Text>
              </Card>
            )}

            <View style={styles.actionRow}>
              <Button
                title="Log Today's Weight"
                onPress={() => setWeightModalVisible(true)}
                icon={<Plus size={20} color={theme.primaryText} />}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Weight Logs</Text>
            {weights.length === 0 ? (
              <Card style={styles.emptyListCard}>
                <Text style={{ color: theme.textSecondary }}>No weight entry logged yet.</Text>
              </Card>
            ) : (
              [...weights].reverse().map((w) => (
                <Card key={w.id} style={styles.logCard}>
                  <View style={styles.logLeft}>
                    <Calendar size={16} color={theme.textSecondary} />
                    <Text style={[styles.logDate, { color: theme.text }]}>{formatDate(w.date)}</Text>
                  </View>
                  <Text style={[styles.logValue, { color: theme.primary, fontWeight: '700' }]}>
                    {w.weight} kg
                  </Text>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ================= tab: NUTRITION ================= */}
        {activeTab === 'nutrition' && (
          <View>
            {/* Calories Rings/Metrics */}
            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <View style={styles.macroHeader}>
                  <View>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>DAILY CALORIES</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                      {todayLog.calories} / {nutritionGoals.calories} kcal
                    </Text>
                  </View>
                  <Utensils size={28} color={theme.primary} />
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBarContainer, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, (todayLog.calories / (nutritionGoals.calories || 2000)) * 100)}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              </Card>
            </View>

            {/* Macros detail */}
            <View style={styles.macrosSubGrid}>
              {/* Protein */}
              <Card style={styles.macroMiniBox}>
                <Text style={[styles.macroMiniLabel, { color: '#ff453a' }]}>PROTEIN</Text>
                <Text style={[styles.macroMiniValue, { color: theme.text }]}>
                  {todayLog.protein}g / {nutritionGoals.protein}g
                </Text>
                <View style={[styles.macroProgressTrack, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.macroProgressFill,
                      {
                        width: `${Math.min(100, (todayLog.protein / (nutritionGoals.protein || 1)) * 100)}%`,
                        backgroundColor: '#ff453a',
                      },
                    ]}
                  />
                </View>
              </Card>

              {/* Carbs */}
              <Card style={styles.macroMiniBox}>
                <Text style={[styles.macroMiniLabel, { color: '#30d158' }]}>CARBS</Text>
                <Text style={[styles.macroMiniValue, { color: theme.text }]}>
                  {todayLog.carbs}g / {nutritionGoals.carbs}g
                </Text>
                <View style={[styles.macroProgressTrack, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.macroProgressFill,
                      {
                        width: `${Math.min(100, (todayLog.carbs / (nutritionGoals.carbs || 1)) * 100)}%`,
                        backgroundColor: '#30d158',
                      },
                    ]}
                  />
                </View>
              </Card>

              {/* Fat */}
              <Card style={styles.macroMiniBox}>
                <Text style={[styles.macroMiniLabel, { color: '#ff9500' }]}>FAT</Text>
                <Text style={[styles.macroMiniValue, { color: theme.text }]}>
                  {todayLog.fat}g / {nutritionGoals.fat}g
                </Text>
                <View style={[styles.macroProgressTrack, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.macroProgressFill,
                      {
                        width: `${Math.min(100, (todayLog.fat / (nutritionGoals.fat || 1)) * 100)}%`,
                        backgroundColor: '#ff9500',
                      },
                    ]}
                  />
                </View>
              </Card>
            </View>

            {/* Quick Actions */}
            <View style={[styles.actionRow, { gap: Spacing.two }]}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Log Meal"
                  onPress={() => setMealModalVisible(true)}
                  icon={<Plus size={18} color={theme.primaryText} />}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Edit Goals"
                  onPress={() => setGoalsModalVisible(true)}
                  variant="secondary"
                  icon={<Settings size={18} color={theme.text} />}
                />
              </View>
            </View>

            {/* Weekly bar chart */}
            {nutritionLogs.length > 0 ? (
              <Card style={styles.chartCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Weekly Calorie Intake</Text>
                <View style={styles.barChartContainer}>
                  {last7DaysCalories.map((d, index) => {
                    const maxCal = Math.max(...last7DaysCalories.map((x) => x.calories), 2000);
                    const heightPercent = `${(d.calories / maxCal) * 100}%`;
                    const isToday = index === 6;
                    return (
                      <View key={index} style={styles.barCol}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: heightPercent as any,
                                backgroundColor: isToday ? theme.primary : theme.textSecondary + '40',
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                          {d.dayName}
                        </Text>
                        <Text style={{ color: theme.text, fontSize: 8, marginTop: 2 }}>
                          {d.calories}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : null}

            {/* Logged meals history */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Meals</Text>
            {todayLog.meals.length === 0 ? (
              <Card style={styles.emptyListCard}>
                <Text style={{ color: theme.textSecondary }}>No meals logged today yet.</Text>
              </Card>
            ) : (
              todayLog.meals.map((meal) => (
                <Card key={meal.id} style={styles.mealRow}>
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealNameText, { color: theme.text }]}>{meal.name}</Text>
                    <Text style={[styles.mealMacrosText, { color: theme.textSecondary }]}>
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </Text>
                  </View>
                  <Text style={[styles.mealCaloriesText, { color: theme.primary }]}>
                    +{meal.calories} kcal
                  </Text>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ================= tab: MEASUREMENTS ================= */}
        {activeTab === 'measurements' && (
          <View>
            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  LATEST SIZE ({activePart.toUpperCase()})
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {latestMeasurement && latestMeasurement[activePart]
                    ? `${latestMeasurement[activePart]} cm`
                    : '--'}
                </Text>
                {latestMeasurement && (
                  <Text style={[styles.summaryDate, { color: theme.textSecondary }]}>
                    Logged on {formatDate(latestMeasurement.date)}
                  </Text>
                )}
              </Card>
            </View>

            {/* Measurement subtabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.partFilter}>
              {(['arms', 'chest', 'waist', 'thighs'] as MeasurementPart[]).map((part) => (
                <Pressable
                  key={part}
                  onPress={() => setActivePart(part)}
                  style={[
                    styles.partButton,
                    { backgroundColor: theme.backgroundSelected },
                    activePart === part && { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={[styles.partText, { color: activePart === part ? theme.primaryText : theme.text }]}>
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {measurementChartData.length > 1 ? (
              <Card style={styles.chartCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Size Trend - {activePart.charAt(0).toUpperCase() + activePart.slice(1)} (cm)
                </Text>
                <LineChart data={measurementChartData} />
              </Card>
            ) : (
              <Card style={styles.emptyChartCard}>
                <Activity size={32} color={theme.textSecondary} />
                <Text style={[styles.emptyChartText, { color: theme.textSecondary }]}>
                  Need at least 2 logs to draw measurement trends
                </Text>
              </Card>
            )}

            <View style={styles.actionRow}>
              <Button
                title="Log Today's Sizes"
                onPress={() => setMeasModalVisible(true)}
                icon={<Plus size={20} color={theme.primaryText} />}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Measurement Logs</Text>
            {measurements.length === 0 ? (
              <Card style={styles.emptyListCard}>
                <Text style={{ color: theme.textSecondary }}>No measurement entry logged yet.</Text>
              </Card>
            ) : (
              [...measurements].reverse().map((m) => (
                <Card key={m.id} style={styles.measLogCard}>
                  <View style={styles.logLeft}>
                    <Calendar size={16} color={theme.textSecondary} />
                    <Text style={[styles.logDate, { color: theme.text }]}>{formatDate(m.date)}</Text>
                  </View>
                  <View style={styles.measGrid}>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Arms</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>{m.arms || '--'} cm</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Chest</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>{m.chest || '--'} cm</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Waist</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>{m.waist || '--'} cm</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Thighs</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>{m.thighs || '--'} cm</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ================= tab: PRS ================= */}
        {activeTab === 'prs' && (
          <View>
            <View style={styles.searchBarContainer}>
              <TextInput
                placeholder="Search exercises..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={<Search size={20} color={theme.textSecondary} />}
              />
            </View>

            {filteredPrs.length === 0 ? (
              <Card style={styles.emptyPrCard}>
                <Trophy size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyPrText, { color: theme.text }]}>No Personal Records</Text>
                <Text style={[styles.emptyPrSubText, { color: theme.textSecondary }]}>
                  Records appear here when you complete exercises during workouts.
                </Text>
              </Card>
            ) : (
              filteredPrs.map((p) => (
                <Card key={p.exerciseId} style={styles.prCard}>
                  <View style={styles.prInfo}>
                    <View style={[styles.trophyIcon, { backgroundColor: '#ff950020' }]}>
                      <Trophy size={20} color="#ff9500" />
                    </View>
                    <View style={styles.prLabels}>
                      <Text style={[styles.prName, { color: theme.text }]}>{p.name}</Text>
                      <Text style={[styles.prCategory, { color: theme.textSecondary }]}>
                        {p.primaryMuscle} • {p.category}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prResult}>
                    <Text style={[styles.prWeight, { color: theme.primary }]}>{p.weight} kg</Text>
                    <Text style={[styles.prReps, { color: theme.textSecondary }]}>{p.reps} reps</Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ================= Log Weight Modal ================= */}
      <Modal visible={weightModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Weight</Text>

            <View style={styles.modalInputWrapper}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Weight (kg)</Text>
              <TextInput
                placeholder="e.g. 74.5"
                value={inputWeight}
                onChangeText={setInputWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setWeightModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogWeight}
                style={[styles.modalSubmit, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.primaryText, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= Log Measurements Modal ================= */}
      <Modal visible={measModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Measurements</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Arms (cm)</Text>
                <TextInput
                  placeholder="e.g. 35.5"
                  value={measArms}
                  onChangeText={setMeasArms}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Chest (cm)</Text>
                <TextInput
                  placeholder="e.g. 102.0"
                  value={measChest}
                  onChangeText={setMeasChest}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Waist (cm)</Text>
                <TextInput
                  placeholder="e.g. 84.0"
                  value={measWaist}
                  onChangeText={setMeasWaist}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Thighs (cm)</Text>
                <TextInput
                  placeholder="e.g. 56.5"
                  value={measThighs}
                  onChangeText={setMeasThighs}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setMeasModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogMeasurements}
                style={[styles.modalSubmit, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.primaryText, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= Log Meal Modal ================= */}
      <Modal visible={mealModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Meal</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Meal / Food Name</Text>
                <TextInput
                  placeholder="e.g. Chicken & Rice"
                  value={mealName}
                  onChangeText={setMealName}
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Calories (kcal)</Text>
                <TextInput
                  placeholder="e.g. 450"
                  value={mealCal}
                  onChangeText={setMealCal}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Protein (g)</Text>
                <TextInput
                  placeholder="e.g. 40"
                  value={mealPro}
                  onChangeText={setMealPro}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Carbs (g)</Text>
                <TextInput
                  placeholder="e.g. 50"
                  value={mealCarb}
                  onChangeText={setMealCarb}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Fat (g)</Text>
                <TextInput
                  placeholder="e.g. 10"
                  value={mealFat}
                  onChangeText={setMealFat}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setMealModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogMeal}
                style={[styles.modalSubmit, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.primaryText, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= Edit Goals Modal ================= */}
      <Modal visible={goalsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Goals</Text>

            <View style={styles.modalInputWrapper}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Calorie Target (kcal)</Text>
              <TextInput
                placeholder="e.g. 2500"
                value={goalCal}
                onChangeText={setGoalCal}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalInputWrapper}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Protein (g)</Text>
              <TextInput
                placeholder="e.g. 160"
                value={goalPro}
                onChangeText={setGoalPro}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalInputWrapper}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Carbs (g)</Text>
              <TextInput
                placeholder="e.g. 220"
                value={goalCarb}
                onChangeText={setGoalCarb}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalInputWrapper}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Fat (g)</Text>
              <TextInput
                placeholder="e.g. 80"
                value={goalFat}
                onChangeText={setGoalFat}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setGoalsModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleUpdateGoals}
                style={[styles.modalSubmit, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.primaryText, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.four,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  summaryContainer: {
    marginBottom: Spacing.four,
  },
  summaryCard: {
    padding: Spacing.four,
    gap: Spacing.one,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryDate: {
    fontSize: 12,
    marginTop: Spacing.half,
  },
  chartCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  emptyChartCard: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  emptyChartText: {
    fontSize: 13,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.three,
  },
  emptyListCard: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  measLogCard: {
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  logValue: {
    fontSize: 15,
  },
  partFilter: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
  },
  partButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    marginRight: Spacing.two,
  },
  partText: {
    fontSize: 12,
    fontWeight: '700',
  },
  measGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  gridItem: {
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchBarContainer: {
    marginBottom: Spacing.four,
  },
  emptyPrCard: {
    padding: Spacing.five,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyPrText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.three,
  },
  emptyPrSubText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  prCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  prInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  trophyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prLabels: {},
  prName: {
    fontSize: 16,
    fontWeight: '700',
  },
  prCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  prResult: {
    alignItems: 'flex-end',
  },
  prWeight: {
    fontSize: 18,
    fontWeight: '800',
  },
  prReps: {
    fontSize: 12,
    marginTop: 2,
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
    marginBottom: Spacing.four,
    textAlign: 'center',
  },
  modalInputWrapper: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.two,
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
  // Nutrition Styles
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.one,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  macrosSubGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  macroMiniBox: {
    flex: 1,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  macroMiniLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  macroMiniValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  macroProgressTrack: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
    paddingTop: Spacing.two,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 12,
    height: 80,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  mealInfo: {
    gap: 2,
    flex: 1,
  },
  mealNameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  mealMacrosText: {
    fontSize: 11,
  },
  mealCaloriesText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
