import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { askMentor } from '../api/api';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import { colors, gradients } from '../theme/colors';

const QUICK = [
  'I feel lost about my career',
  'How to stay motivated?',
  'I am afraid of failure',
  'How to find my purpose?',
  'I feel overwhelmed',
  'Balance studies and life?',
];

export default function MentorScreen({ navigation }) {
  const [messages, setMessages] = useState([{
    role: 'ai',
    content: 'Namaste 🙏\n\nDear seeker, I am here to guide you with the wisdom of the Bhagavad Gita.\n\n"You have a right to perform your duties, but not to the fruits." — Gita 2.47\n\nWhat troubles your heart today?'
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await askMentor(text);
      setMessages(m => [...m, { role: 'ai', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', content: 'The divine connection was interrupted. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={{ fontSize: 28 }}>🪷</Text>
            <View>
              <Text style={styles.title}>Krishna Mentor</Text>
              <Text style={styles.sub}>Bhagavad Gita Wisdom</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ChatBubble role={item.role} text={item.content} avatar="🪷" />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* Quick prompts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
          {QUICK.map((q, i) => (
            <TouchableOpacity key={i} onPress={() => send(q)} style={styles.quickBtn}>
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput style={styles.input} value={input} onChangeText={setInput}
            placeholder="Ask Krishna for guidance..." placeholderTextColor="rgba(245,158,11,0.3)"
            onSubmitEditing={() => send()} returnKeyType="send" editable={!loading} />
          <TouchableOpacity onPress={() => send()} disabled={loading || !input.trim()} style={styles.sendBtn}>
            <LinearGradient colors={['#f59e0b', '#ea580c']} style={styles.sendGrad}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  back:         { color: colors.white60, fontSize: 15 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title:        { fontSize: 16, fontWeight: '800', color: '#fff' },
  sub:          { fontSize: 11, color: colors.white40 },
  quickScroll:  { maxHeight: 44, marginBottom: 4 },
  quickBtn:     { backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  quickText:    { color: 'rgba(245,158,11,0.8)', fontSize: 12 },
  inputBar:     { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
  input:        { flex: 1, backgroundColor: 'rgba(245,158,11,0.05)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14 },
  sendBtn:      { width: 46, height: 46, borderRadius: 14, overflow: 'hidden' },
  sendGrad:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
