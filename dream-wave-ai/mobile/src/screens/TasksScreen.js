import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { listTasks, generateTasks, completeTask } from '../api/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

export default function TasksScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [goal, setGoal]         = useState(user?.goal || '');
  const [loading, setLoading]   = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await listTasks(); setTasks(data.tasks || []); }
    catch {} finally { setLoading(false); }
  };

  const generate = async () => {
    if (!goal.trim()) return;
    setGenLoading(true);
    try {
      const { data } = await generateTasks(goal);
      setTasks(p => [...(data.tasks || []), ...p]);
    } catch {} finally { setGenLoading(false); }
  };

  const complete = async (id) => {
    try {
      const { data } = await completeTask(id);
      setTasks(p => p.map(t => t._id === id ? { ...t, completed: true } : t));
      if (setUser) setUser(u => ({ ...u, streak: data.streak, credits: data.credits }));
    } catch {}
  };

  const pending   = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  const streakPct = Math.min(((user?.streak || 0) / 100) * 100, 100);

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>✅ Daily Tasks</Text>
      </View>

      <FlatList
        data={pending}
        keyExtractor={i => i._id}
        ListHeaderComponent={() => (
          <View style={{ padding: 16 }}>
            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { icon: '🔥', label: 'Streak',  value: user?.streak  || 0 },
                { icon: '💰', label: 'Credits', value: user?.credits || 0 },
                { icon: '✅', label: 'Done',    value: completed.length },
              ].map(s => (
                <GlassCard key={s.label} style={styles.statCard}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={styles.statVal}>{s.value}</Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </GlassCard>
              ))}
            </View>

            {/* Streak bar */}
            <GlassCard style={{ marginBottom: 16 }}>
              <View style={styles.streakRow}>
                <Text style={styles.streakLabel}>🔥 Streak Progress</Text>
                <Text style={styles.streakLabel}>{user?.streak || 0} / 100</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${streakPct}%` }]} />
              </View>
            </GlassCard>

            {/* Generate */}
            <GlassCard style={{ marginBottom: 16 }}>
              <TextInput style={styles.input} value={goal} onChangeText={setGoal}
                placeholder="Your goal (e.g. Software Engineer)" placeholderTextColor={colors.white40} />
              <GradientButton title={genLoading ? 'Generating...' : '✨ Generate Tasks'}
                onPress={generate} disabled={genLoading || !goal.trim()} style={{ marginTop: 10 }} />
            </GlassCard>

            {loading && <ActivityIndicator color={colors.violet} style={{ marginVertical: 20 }} />}
            {pending.length > 0 && <Text style={styles.sectionLabel}>PENDING ({pending.length})</Text>}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => complete(item._id)} style={styles.checkbox} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
              <View style={styles.tagRow}>
                <Text style={styles.tag}>{item.type}</Text>
                <Text style={[styles.tag, { backgroundColor: 'rgba(245,158,11,0.15)', color: colors.amber }]}>+{item.points} pts</Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={() => completed.length > 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={styles.sectionLabel}>COMPLETED ({completed.length})</Text>
            {completed.map(t => (
              <View key={t._id} style={[styles.taskRow, { opacity: 0.4 }]}>
                <View style={[styles.checkbox, { backgroundColor: colors.emerald, borderColor: colors.emerald }]}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                </View>
                <Text style={[styles.taskTitle, { textDecorationLine: 'line-through' }]}>{t.title}</Text>
              </View>
            ))}
          </View>
        ) : null}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  back:         { color: colors.white60, fontSize: 15 },
  title:        { fontSize: 18, fontWeight: '900', color: '#fff' },
  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard:     { flex: 1, alignItems: 'center', padding: 10 },
  statIcon:     { fontSize: 18, marginBottom: 2 },
  statVal:      { fontSize: 16, fontWeight: '900', color: '#fff' },
  statLbl:      { fontSize: 10, color: colors.white40 },
  streakRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  streakLabel:  { fontSize: 12, color: colors.white40 },
  barBg:        { height: 6, backgroundColor: colors.white10, borderRadius: 3 },
  barFill:      { height: 6, backgroundColor: colors.amber, borderRadius: 3 },
  input:        { backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: '#fff', fontSize: 13 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.white40, letterSpacing: 1, marginBottom: 8, paddingHorizontal: 16 },
  taskRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 16, padding: 14 },
  checkbox:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.violetLight, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  taskTitle:    { fontSize: 14, fontWeight: '600', color: '#fff' },
  taskDesc:     { fontSize: 12, color: colors.white40, marginTop: 2 },
  tagRow:       { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag:          { fontSize: 11, backgroundColor: colors.violetDim, color: colors.violetLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
});
