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
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { LineChart } from '@/components/ui/LineChart';
import { Spacing } from '@/constants/theme';
import { Flame, Trophy, Plus, Search, Calendar, ChevronRight, Activity } from 'lucide-react-native';

type SubTab = 'weight' | 'measurements' | 'prs';
type MeasurementPart = 'arms' | 'chest' | 'waist' | 'thighs';

export default function AnalyticsScreen() {
  const { weights, measurements, prs, logWeight, logMeasurements, isLoading } = useAnalyticsStore();
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
          onPress={() => setActiveTab('measurements')}
          style={[styles.tabButton, activeTab === 'measurements' && { borderBottomColor: theme.primary }]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'measurements' ? theme.primary : theme.textSecondary },
            ]}
          >
            Body Size
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
                  {activePart.charAt(0).toUpperCase() + activePart.slice(1)} Size Trend (cm)
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
                title="Log Body Sizes"
                onPress={() => setMeasModalVisible(true)}
                icon={<Plus size={20} color={theme.primaryText} />}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Measurement Logs</Text>
            {measurements.length === 0 ? (
              <Card style={styles.emptyListCard}>
                <Text style={{ color: theme.textSecondary }}>No measurements logged yet.</Text>
              </Card>
            ) : (
              [...measurements].reverse().map((m) => (
                <Card key={m.id} style={styles.logCardCol}>
                  <View style={styles.logHeader}>
                    <Calendar size={16} color={theme.textSecondary} />
                    <Text style={[styles.logDate, { color: theme.text }]}>{formatDate(m.date)}</Text>
                  </View>
                  <View style={styles.logGrid}>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Chest</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>
                        {m.chest ? `${m.chest} cm` : '--'}
                      </Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Waist</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>
                        {m.waist ? `${m.waist} cm` : '--'}
                      </Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Arms</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>
                        {m.arms ? `${m.arms} cm` : '--'}
                      </Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Thighs</Text>
                      <Text style={[styles.gridValue, { color: theme.text }]}>
                        {m.thighs ? `${m.thighs} cm` : '--'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ================= tab: PERSONAL RECORDS ================= */}
        {activeTab === 'prs' && (
          <View>
            <View style={styles.searchBarContainer}>
              <TextInput
                placeholder="Search record..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={<Search size={20} color={theme.textSecondary} />}
              />
            </View>

            {filteredPrs.length === 0 ? (
              <Card style={styles.emptyPrCard}>
                <Trophy size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyPrText, { color: theme.textSecondary }]}>
                  {searchQuery ? 'No matching record' : 'No personal record logged yet'}
                </Text>
                <Text style={[styles.emptyPrSubText, { color: theme.textSecondary }]}>
                  Complete exercises with sets in your workout tracking to unlock gold record trophies!
                </Text>
              </Card>
            ) : (
              filteredPrs.map((pr) => (
                <Card key={pr.exerciseId} style={styles.prCard}>
                  <View style={styles.prInfo}>
                    <View style={[styles.trophyIcon, { backgroundColor: '#ffe8c4' }]}>
                      <Trophy size={20} color="#ff9500" fill="#ff9500" />
                    </View>
                    <View style={styles.prLabels}>
                      <Text style={[styles.prName, { color: theme.text }]}>{pr.name}</Text>
                      <Text style={[styles.prCategory, { color: theme.textSecondary }]}>
                        {pr.primaryMuscle} • {pr.category}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prResult}>
                    <Text style={[styles.prWeight, { color: theme.primary }]}>{pr.weight} kg</Text>
                    <Text style={[styles.prReps, { color: theme.textSecondary }]}>{pr.reps} reps</Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: WEIGHT ================= */}
      <Modal visible={weightModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Today's Weight</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                placeholder="Weight (kg)"
                value={inputWeight}
                onChangeText={setInputWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setWeightModalVisible(false)} style={styles.modalCancel}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleLogWeight} style={[styles.modalSubmit, { backgroundColor: theme.primary }]}>
                <Text style={{ color: theme.primaryText, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: MEASUREMENTS ================= */}
      <Modal visible={measModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Body Sizes</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Chest Size (cm)</Text>
                <TextInput
                  placeholder="Chest"
                  value={measChest}
                  onChangeText={setMeasChest}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Waist Size (cm)</Text>
                <TextInput
                  placeholder="Waist"
                  value={measWaist}
                  onChangeText={setMeasWaist}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Arms Size (cm)</Text>
                <TextInput
                  placeholder="Arms"
                  value={measArms}
                  onChangeText={setMeasArms}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Thighs Size (cm)</Text>
                <TextInput
                  placeholder="Thighs"
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
              <Pressable onPress={handleLogMeasurements} style={[styles.modalSubmit, { backgroundColor: theme.primary }]}>
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
    paddingTop: Spacing.five,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
  },
  summaryContainer: {
    marginBottom: Spacing.three,
  },
  summaryCard: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.one,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  summaryDate: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
  chartCard: {
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  emptyChartCard: {
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    height: 200,
  },
  emptyChartText: {
    marginTop: Spacing.three,
    fontSize: 14,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Spacing.one,
    marginBottom: Spacing.two,
  },
  actionRow: {
    marginBottom: Spacing.five,
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
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  logValue: {
    fontSize: 16,
  },
  partFilter: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  partButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    marginRight: Spacing.two,
  },
  partText: {
    fontSize: 14,
    fontWeight: '700',
  },
  logCardCol: {
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: Spacing.two,
    marginBottom: Spacing.two,
  },
  logGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  gridItem: {
    width: '45%',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
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
});
