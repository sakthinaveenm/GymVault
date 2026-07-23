import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/hooks/use-theme';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { Dumbbell, User, Mail, Lock } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const theme = useTheme();
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const success = await register(email, name, password);
    if (!success) {
      setError('Registration failed. Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={[styles.logoBg, { backgroundColor: theme.backgroundElement }]}>
            <Dumbbell size={40} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Join GymVault</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Start tracking your workouts today.
          </Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            label="Full Name"
            placeholder="enter your name..."
            value={name}
            onChangeText={setName}
            icon={<User size={20} color={theme.textSecondary} />}
          />

          <TextInput
            label="Email Address"
            placeholder="enter email..."
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={20} color={theme.textSecondary} />}
          />

          <TextInput
            label="Password"
            placeholder="enter password (min 6 chars)..."
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            icon={<Lock size={20} color={theme.textSecondary} />}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={{ color: theme.textSecondary }}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    gap: Spacing.two,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    gap: Spacing.three,
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
  error: {
    color: '#ff453a',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
});
