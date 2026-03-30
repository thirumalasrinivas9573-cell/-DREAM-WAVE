import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { askDailyLife } from '../api/api';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import { colors, gradients } from '../theme/colors';

const CATS = [
  { id: 'cooking',      icon: '🍳', label: 'Cooking' },
  { id: 'fitness',      icon: '💪', label: 'Fitness' },
  { id: 'yoga',         icon: '🧘', label: 'Yoga' },
  { id: 'lifestyle',    icon: '🌿', label: 'Lifestyle' },
  { id: 'productivity', icon: '⚡', label: 'Productivity' },
  { id: 'general',      icon: '✨', label: 'General' },
];

export default function DailyLifeScreen({ navigation }) {
  const [cat, setCat]       = useState('cooking');
  const [messages, setMessages] = useState([]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const current = CATS.find(c => c.id === cat);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await askDailyLife(text, cat);
      setMessages(m => [...m, { role: 'ai', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', content: 'Sorry, could not get a response. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <Text style={styles.title}>🌿 Daily Life AI</Text>
        </View>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {CATS.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setCat(c.id)}
              style={[styles.catBtn, cat === c.id && styles.catActive]}>
              <Text style={styles.catText}>{c.icon} {c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {messages.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>{current.icon}</Text>
            <Text style={styles.emptyText}>Ask me anything about {current.label.toLowerCase()}!</Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ChatBubble role={item.role} text={item.content} avatar={current.icon} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        <View style={styles.inputBar}>
          <TextInput style={styles.input} value={input} onChangeText={setInput}
            placeholder={`Ask about ${current.label.toLowerCase()}...`} placeholderTextColor={colors.white40}
            onSubmitEditing={send} returnKeyType="send" editable={!loading} />
          <TouchableOpacity onPress={send} disabled={loading || !input.trim()} style={styles.sendBtn}>
            <LinearGradient colors={gradients.primary} style={styles.sendGrad}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8, gap: 12 },
  back:      { color: colors.white60, fontSize: 15 },
  title:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  catScroll: { maxHeight: 48, marginBottom: 4 },
  catBtn:    { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  catActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  catText:   { color: '#fff', fontSize: 12, fontWeight: '600' },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: colors.white40, fontSize: 13 },
  inputBar:  { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
  input:     { flex: 1, backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14 },
  sendBtn:   { width: 46, height: 46, borderRadius: 14, overflow: 'hidden' },
  sendGrad:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
