import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Vibration, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { X, Bell } from 'lucide-react-native';

interface RestTimerProps {
  isVisible: boolean;
  initialTime?: number; // In seconds, default 90
  onClose: () => void;
}

export function RestTimer({ isVisible, initialTime = 90, onClose }: RestTimerProps) {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(initialTime);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [isVisible, initialTime]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Trigger Alarm
      Vibration.vibrate([0, 500, 100, 500]);
      setIsActive(false);
      // Automatically close after minor delay so they see 0:00
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAdjust = (amount: number) => {
    setTimeLeft((prev) => Math.max(0, prev + amount));
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={styles.titleRow}>
            <Bell size={20} color={theme.primary} />
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Rest Timer</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Timer numbers */}
        <View style={styles.timerDisplay}>
          <Text style={[styles.timerNumbers, { color: theme.text }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={[styles.timerSubtitle, { color: theme.textSecondary }]}>
            {timeLeft > 0 ? 'Resting between sets...' : 'Time to lift!'}
          </Text>
        </View>

        {/* Adjustment buttons */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => handleAdjust(-15)}
            style={[styles.adjustBtn, { backgroundColor: theme.backgroundSelected }]}
          >
            <Text style={[styles.adjustText, { color: theme.text }]}>-15s</Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={[styles.skipBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.skipText, { color: theme.primaryText }]}>Skip Rest</Text>
          </Pressable>

          <Pressable
            onPress={() => handleAdjust(15)}
            style={[styles.adjustBtn, { backgroundColor: theme.backgroundSelected }]}
          >
            <Text style={[styles.adjustText, { color: theme.text }]}>+15s</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Platform.OS === 'ios' ? Spacing.five : Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: Spacing.one,
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  timerNumbers: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 2,
  },
  timerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.two,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  adjustBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    fontSize: 15,
    fontWeight: '700',
  },
  skipBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
