import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { colors, gradients } from '../theme/colors';

const CARDS = [
  { icon: '🎯', label: 'Set Goal',      screen: 'GoalChat',   grad: ['rgba(124,58,237,0.3)', 'rgba(124,58,237,0.05)'] },
  { icon: '🗺️', label: 'Roadmap',      screen: 'Roadmap',    grad: ['rgba(236,72,153,0.3)', 'rgba(236,72,153,0.05)'] },
  { icon: '📊', label: 'R&D Report',    screen: 'Report',     grad: ['rgba(59,130,246,0.3)', 'rgba(59,130,246,0.05)'] },
  { icon: '✅', label: 'Tasks',         screen: 'Tasks',      grad: ['rgba(16,185,129,0.3)', 'rgba(16,185,129,0.05)'] },
  { icon: '📖', label: 'Books',         screen: 'Books',      grad: ['rgba(244,63,94,0.3)',  'rgba(244,63,94,0.05)']  },
  { icon: '🌿', label: 'Daily Life AI', screen: 'DailyLife',  grad: ['rgba(20,184,166,0.3)', 'rgba(20,184,166,0.05)'] },
  { icon: '🪷', label: 'Mentor',        screen: 'Mentor',     grad: ['rgba(245,158,11,0.3)', 'rgba(245,158,11,0.05)'] },
  { icon: '👥', label: 'Community',     screen: 'Community',  grad: ['rgba(99,102,241,0.3)', 'rgba(99,102,241,0.05)'] },
];

function getLevelLabel(l) {
  if (l >= 10) return 'Master';
  if (l >= 8)  return 'Expert';
  if (l >= 6)  return 'Achiever';
  if (l >= 4)  return 'Learner';
  if (l >= 2)  return 'Explorer';
  return 'Beginner';
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const level = user?.level || 1;

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0]} 👋</Text>
            {user?.goal ? (
              <Text style={styles.goal}>🎯 {user.goal}</Text>
            ) : (
              <Text style={styles.goal}>Set your career goal to get started</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarBtn}>
              <Text style={{ fontSize: 20 }}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: '💰', label: 'Credits', value: user?.credits || 0 },
            { icon: '🔥', label: 'Streak',  value: user?.streak  || 0 },
            { icon: '⭐', label: 'Level',   value: level },
            { icon: '🏅', label: 'Rank',    value: getLevelLabel(level) },
          ].map(s => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Feature grid */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.grid}>
          {CARDS.map(c => (
            <TouchableOpacity key={c.label} onPress={() => navigation.navigate(c.screen)}
              style={styles.cardWrap} activeOpacity={0.85}>
              <LinearGradient colors={c.grad} style={styles.card}>
                <Text style={styles.cardIcon}>{c.icon}</Text>
                <Text style={styles.cardLabel}>{c.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll:       { padding: 20, paddingTop: 56 },
  header:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  greeting:     { fontSize: 14, color: colors.white40 },
  name:         { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
  goal:         { fontSize: 12, color: colors.white40, marginTop: 4 },
  avatarBtn:    { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.violetDim, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 28 },
  statCard:     { flex: 1, alignItems: 'center', padding: 10 },
  statIcon:     { fontSize: 18, marginBottom: 4 },
  statValue:    { fontSize: 16, fontWeight: '900', color: '#fff' },
  statLabel:    { fontSize: 10, color: colors.white40, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.white40, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardWrap:     { width: '47%' },
  card:         { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.glassBorder },
  cardIcon:     { fontSize: 28, marginBottom: 10 },
  cardLabel:    { fontSize: 13, fontWeight: '700', color: colors.white80 },
});
