import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Typing dots animation
export function TypingIndicator() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={[styles.bubble, styles.ai]}>
      <Text style={styles.aiText}>Thinking{dots}</Text>
    </View>
  );
}

export default function ChatBubble({ role, text, avatar }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={{ fontSize: 16 }}>{avatar || '🤖'}</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.user : styles.ai]}>
        <Text style={isUser ? styles.userText : styles.aiText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  rowUser:  { justifyContent: 'flex-end' },
  rowAi:    { justifyContent: 'flex-start', alignItems: 'flex-end' },
  avatar:   { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.violetDim, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 2 },
  bubble:   { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  user:     { backgroundColor: colors.violet, borderBottomRightRadius: 4 },
  ai:       { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderBottomLeftRadius: 4 },
  userText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  aiText:   { color: colors.white80, fontSize: 14, lineHeight: 20 },
});
