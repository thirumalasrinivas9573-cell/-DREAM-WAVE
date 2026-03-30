import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { startGoalChat, continueGoalChat } from '../api/api';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

export default function GoalChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [done, setDone]         = useState(false);
  const [step, setStep]         = useState(0);
  const listRef = useRef(null);

  useEffect(() => { startChat(); }, []);

  const startChat = async () => {
    setLoading(true);
    try {
      const { data } = await startGoalChat();
      setSessionId(data.sessionId);
      setStep(data.step || 1);
      setMessages([{ role: 'assistant', content: data.message }]);
    } catch { setMessages([{ role: 'assistant', content: 'Failed to start. Please go back and try again.' }]); }
    finally { setLoading(false); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading || done) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { data } = await continueGoalChat(sessionId, text);
      setMessages(m => [...m, { role: 'assistant', content: data.message }]);
      setStep(data.step || step);
      if (data.completed) setDone(true);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const progress = Math.min((step / 5) * 100, 100);

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={{ color: colors.white60, fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎯 Set Your Goal</Text>
          <Text style={styles.stepText}>Step {Math.min(step, 5)} / 5</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ChatBubble role={item.role === 'assistant' ? 'ai' : 'user'} text={item.content} avatar="🤖" />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* Done state */}
        {done ? (
          <View style={styles.doneBar}>
            <Text style={styles.doneText}>✅ Goal analysis complete!</Text>
            <GradientButton title="View Roadmap →" onPress={() => navigation.navigate('Roadmap')} style={{ flex: 1 }} />
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your answer..."
              placeholderTextColor={colors.white40}
              onSubmitEditing={send}
              returnKeyType="send"
              editable={!loading}
            />
            <TouchableOpacity onPress={send} disabled={loading || !input.trim()} style={styles.sendBtn}>
              <LinearGradient colors={gradients.primary} style={styles.sendGrad}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 8 },
  back:        { marginRight: 4 },
  title:       { flex: 1, fontSize: 16, fontWeight: '800', color: '#fff' },
  stepText:    { fontSize: 12, color: colors.white40 },
  progressBg:  { height: 3, backgroundColor: colors.white10, marginHorizontal: 16, borderRadius: 2, marginBottom: 4 },
  progressFill:{ height: 3, backgroundColor: colors.violet, borderRadius: 2 },
  inputBar:    { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
  input:       { flex: 1, backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14 },
  sendBtn:     { width: 46, height: 46, borderRadius: 14, overflow: 'hidden' },
  sendGrad:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneBar:     { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, alignItems: 'center' },
  doneText:    { color: colors.emerald, fontSize: 13, fontWeight: '600' },
});
