import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getBooks } from '../api/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

const LEVEL_COLOR = { Beginner: colors.emerald, Intermediate: colors.amber, Advanced: colors.red };

export default function BooksScreen({ navigation }) {
  const { user } = useAuth();
  const [goal, setGoal]     = useState(user?.goal || '');
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const fetch = async () => {
    if (!goal.trim()) { setError('Enter a goal first'); return; }
    setError(''); setLoading(true); setBooks([]);
    try {
      const { data } = await getBooks(goal.trim());
      setBooks(data.books || []);
    } catch { setError('Failed to fetch books. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>📖 Books</Text>
      </View>

      <FlatList
        data={books}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={() => (
          <View style={{ padding: 16 }}>
            <GlassCard style={{ marginBottom: 16 }}>
              <TextInput style={styles.input} value={goal} onChangeText={setGoal}
                placeholder="Enter your career goal..." placeholderTextColor={colors.white40}
                onSubmitEditing={fetch} returnKeyType="search" />
              <GradientButton title={loading ? '⏳ Loading...' : '🔍 Get Books'}
                onPress={fetch} disabled={loading} style={{ marginTop: 10 }} />
            </GlassCard>
            {!!error && <Text style={styles.error}>{error}</Text>}
            {loading && <ActivityIndicator color={colors.violet} style={{ marginVertical: 20 }} />}
          </View>
        )}
        renderItem={({ item }) => (
          <GlassCard style={styles.bookCard}>
            <View style={styles.bookHeader}>
              <Text style={{ fontSize: 28 }}>📚</Text>
              <View style={styles.tags}>
                <Text style={[styles.tag, { color: LEVEL_COLOR[item.level] || colors.violetLight }]}>{item.level}</Text>
                <Text style={styles.tag}>{item.category}</Text>
                {item.free && <Text style={[styles.tag, { color: colors.emerald }]}>Free</Text>}
              </View>
            </View>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookAuthor}>by {item.author}</Text>
            <Text style={styles.bookDesc}>{item.description}</Text>
          </GlassCard>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📚</Text>
            <Text style={styles.emptyText}>Enter a goal to get book recommendations</Text>
          </View>
        ) : null}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  back:      { color: colors.white60, fontSize: 15 },
  title:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  input:     { backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: '#fff', fontSize: 13 },
  error:     { color: colors.red, fontSize: 13, marginBottom: 12 },
  bookCard:  { marginHorizontal: 16, marginBottom: 12 },
  bookHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  tags:      { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
  tag:       { fontSize: 11, color: colors.violetLight, backgroundColor: colors.violetDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bookTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  bookAuthor:{ fontSize: 12, color: colors.white40, marginTop: 2 },
  bookDesc:  { fontSize: 12, color: colors.white60, marginTop: 6, lineHeight: 18 },
  empty:     { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { color: colors.white40, fontSize: 13 },
});
