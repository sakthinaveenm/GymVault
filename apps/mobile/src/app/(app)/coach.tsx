import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useWorkoutStore, Routine } from '@/store/workout.store';
import { useAnalyticsStore } from '@/store/analytics.store';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/hooks/use-theme';
import { TextInput } from '@/components/ui/TextInput';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { Send, Brain, Sparkles, Plus } from 'lucide-react-native';
import { API_URL } from '@/constants/api';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  suggestedRoutine?: any;
}

export default function CoachScreen() {
  const theme = useTheme();
  const { history, routines, createRoutine } = useWorkoutStore();
  const { weights } = useAnalyticsStore();
  const { token } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: "Hi! I am your Vault AI Coach. 🏋️‍♂️\n\nAsk me to analyze your progress, suggest personalized routines, or explain exercise form!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    
    // Auto scroll down
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await fetch(`${API_URL}/coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history,
          routines,
          weights,
        }),
      });

      const json = await response.json();
      
      const coachMessage: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'coach',
        text: json.reply || "Sorry, I couldn't process that request.",
        suggestedRoutine: json.suggestedRoutine,
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (e) {
      // Local fallback offline response
      const fallbackReply = generateOfflineResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: 'coach',
          text: fallbackReply.reply,
          suggestedRoutine: fallbackReply.suggestedRoutine,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const generateOfflineResponse = (query: string) => {
    const prompt = query.toLowerCase();
    if (prompt.includes('analyze') || prompt.includes('progress')) {
      const total = history.length;
      return {
        reply: `### Local Performance Analysis (Offline) 📉\n\n- **Completed Workouts**: ${total} sessions.\n- **Status**: Backend sync offline.\n\n*Reconnect to your backend server to access full muscular distribution logs!*`,
      };
    }

    if (prompt.includes('routine') || prompt.includes('suggest') || prompt.includes('plan')) {
      return {
        reply: `Here is a custom Full Body Blast routine template! Click the button below to import it into your templates.`,
        suggestedRoutine: {
          title: 'Offline Full Body Blast',
          exercises: [
            {
              id: '1',
              name: 'Barbell Bench Press',
              category: 'Barbell',
              primaryMuscle: 'Chest',
              sets: [{ id: 'o1', weight: 60, reps: 10, isCompleted: false }],
            },
            {
              id: '3',
              name: 'Barbell Squat',
              category: 'Barbell',
              primaryMuscle: 'Legs',
              sets: [{ id: 'o2', weight: 70, reps: 8, isCompleted: false }],
            },
          ],
        },
      };
    }

    return {
      reply: `Hi! It looks like you're currently offline. You can still test my core features:\n\n1. Type **"analyze progress"** for a quick local stats breakdown.\n2. Type **"suggest a routine"** to get a template you can import.`,
    };
  };

  const handleImportRoutine = async (routine: any) => {
    try {
      await createRoutine(routine.title, routine.exercises);
      Alert.alert('Import Success', `"${routine.title}" has been saved to your Workout routines list!`);
    } catch (e) {
      Alert.alert('Error', 'Failed to import routine. Please try again.');
    }
  };

  const renderSuggestedRoutine = (routine: any) => {
    return (
      <Card style={styles.routineCard}>
        <View style={styles.routineCardHeader}>
          <Sparkles size={16} color={theme.primary} />
          <Text style={[styles.routineCardTitle, { color: theme.text }]}>{routine.title}</Text>
        </View>
        <View style={styles.routineExercises}>
          {routine.exercises.map((ex: any, idx: number) => (
            <Text key={idx} style={[styles.exerciseItemText, { color: theme.textSecondary }]}>
              • {ex.name} ({ex.sets.length} sets)
            </Text>
          ))}
        </View>
        <Pressable
          onPress={() => handleImportRoutine(routine)}
          style={[styles.importBtn, { backgroundColor: theme.primary }]}
        >
          <Plus size={16} color={theme.primaryText} />
          <Text style={[styles.importBtnText, { color: theme.primaryText }]}>Save Routine</Text>
        </Pressable>
      </Card>
    );
  };

  // Helper to format response text (simple bold/list formatter)
  const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold Markdown check
      let processed = line;
      const isBold = line.startsWith('**') && line.endsWith('**');
      if (isBold) {
        processed = line.replace(/\*\*/g, '');
      }

      return (
        <Text
          key={idx}
          style={[
            styles.messageLine,
            isBold && { fontWeight: '800', fontSize: 15 },
            line.startsWith('###') && { fontWeight: '900', fontSize: 18, marginVertical: 6 },
          ]}
        >
          {processed}
          {idx < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Brain size={28} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>Coach Chat</Text>
      </View>

      {/* Message List */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <View key={msg.id} style={styles.messageRow}>
              <View
                style={[
                  styles.messageBubble,
                  isCoach
                    ? [styles.coachBubble, { backgroundColor: theme.backgroundSelected }]
                    : [styles.userBubble, { backgroundColor: theme.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isCoach ? theme.text : theme.primaryText },
                  ]}
                >
                  {formatMessageText(msg.text)}
                </Text>
                {isCoach && msg.suggestedRoutine && renderSuggestedRoutine(msg.suggestedRoutine)}
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={theme.primary} size="small" />
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Coach is analyzing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input container */}
      <View style={[styles.inputWrapper, { borderTopColor: theme.backgroundSelected }]}>
        {/* Quick chip responses */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <Pressable
            onPress={() => sendMessage('Analyze my progress')}
            style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}
          >
            <Text style={[styles.chipText, { color: theme.text }]}>Analyze Progress</Text>
          </Pressable>
          <Pressable
            onPress={() => sendMessage('Suggest a leg routine')}
            style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}
          >
            <Text style={[styles.chipText, { color: theme.text }]}>Suggest Leg Routine</Text>
          </Pressable>
          <Pressable
            onPress={() => sendMessage('Explain Bench Press form')}
            style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}
          >
            <Text style={[styles.chipText, { color: theme.text }]}>Bench Press Form</Text>
          </Pressable>
        </ScrollView>

        {/* Text Input Row */}
        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Ask coach anything..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage(inputText)}
            />
          </View>
          <Pressable
            onPress={() => sendMessage(inputText)}
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
          >
            <Send size={18} color={theme.primaryText} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  chatContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  messageRow: {
    flexDirection: 'column',
    width: '100%',
    marginVertical: 4,
  },
  messageBubble: {
    padding: Spacing.three,
    borderRadius: 16,
    maxWidth: '85%',
  },
  coachBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageLine: {
    lineHeight: 20,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    marginVertical: Spacing.two,
  },
  inputWrapper: {
    padding: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  chipsContainer: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCard: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  routineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  routineCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  routineExercises: {
    gap: Spacing.half,
  },
  exerciseItemText: {
    fontSize: 13,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    marginTop: Spacing.one,
  },
  importBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
