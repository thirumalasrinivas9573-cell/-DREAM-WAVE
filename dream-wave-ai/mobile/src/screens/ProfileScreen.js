import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { updateMe } from '../api/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

function getLevelLabel(l) {
  if (l >= 10) return 'Master'; if (l >= 8) return 'Expert';
  if (l >= 6)  return 'Achiever'; if (l >= 4) return 'Learner';
  if (l >= 2)  return 'Explorer'; return 'Beginner';
}

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', goal: user?.goal || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const { data } = await updateMe(form);
      setUser(data.user);
      setMsg('✅ Profile updated!');
      setEditing(false);
    } catch (err) {
      setMsg(err.response?.data?.message || '❌ Update failed');
    } finally { setSaving(false); }
  };

  const copyAaId = async () => {
    await Clipboard.setStringAsync(user?.aaId || '');
    Alert.alert('Copied!', `AA ID ${user?.aaId} copied to clipboard`);
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const level = user?.level || 1;
  const streakPct = Math.min(((user?.streak || 0) / 100) * 100, 100);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>👤 Profile</Text>
        <TouchableOpacity onPress={confirmLogout}><Text style={styles.logout}>Logout</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNum}>{level}</Text>
              <Text style={styles.levelLbl}>LVL</Text>
            </View>
          </View>

          {/* AA ID */}
          <TouchableOpacity onPress={copyAaId} style={styles.aaIdRow}>
            <Text style={styles.aaIdText}>{user?.aaId}</Text>
            <Text style={styles.aaIdCopy}>📋 Copy</Text>
          </TouchableOpacity>

          {user?.goal ? (
            <View style={styles.goalRow}>
              <Text style={{ fontSize: 14 }}>🎯</Text>
              <Text style={styles.goalText}>{user.goal}</Text>
            </View>
          ) : null}

          <Text style={styles.levelLabel}>{getLevelLabel(level)}</Text>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: '🔥', label: 'Streak',  value: user?.streak  || 0 },
            { icon: '💰', label: 'Credits', value: user?.credits || 0 },
            { icon: '⭐', label: 'Level',   value: level },
          ].map(s => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</Text>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Streak bar */}
        <GlassCard style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.barLabel}>🔥 Streak to next credit</Text>
            <Text style={styles.barLabel}>{user?.streak || 0} / 100</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${streakPct}%` }]} />
          </View>
        </GlassCard>

        {/* Edit form */}
        {!editing ? (
          <GradientButton title="✏️ Edit Profile" onPress={() => { setEditing(true); setMsg(''); }} />
        ) : (
          <GlassCard>
            <Text style={styles.formTitle}>Edit Profile</Text>
            {[
              { key: 'name',   label: 'Display Name',  placeholder: 'Your name' },
              { key: 'bio',    label: 'Bio',            placeholder: 'Tell something about yourself...' },
              { key: 'goal',   label: 'Career Goal',    placeholder: 'e.g. Software Engineer' },
              { key: 'avatar', label: 'Avatar URL',     placeholder: 'https://...' },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput style={styles.input} value={form[f.key]} onChangeText={v => set(f.key, v)}
                  placeholder={f.placeholder} placeholderTextColor={colors.white40}
                  multiline={f.key === 'bio'} numberOfLines={f.key === 'bio' ? 2 : 1} />
              </View>
            ))}
            {!!msg && <Text style={[styles.msg, { color: msg.startsWith('✅') ? colors.emerald : colors.red }]}>{msg}</Text>}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <GradientButton title={saving ? 'Saving...' : 'Save'} onPress={save} disabled={saving} style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
                <Text style={{ color: colors.white60, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        <Text style={styles.memberSince}>
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'recently'}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  back:        { color: colors.white60, fontSize: 15, flex: 1 },
  title:       { fontSize: 18, fontWeight: '900', color: '#fff' },
  logout:      { color: colors.red, fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
  profileCard: { marginBottom: 16 },
  profileRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  avatar:      { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.violetDim, borderWidth: 2, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  name:        { fontSize: 18, fontWeight: '900', color: '#fff' },
  email:       { fontSize: 12, color: colors.white40, marginTop: 2 },
  bio:         { fontSize: 12, color: colors.white60, marginTop: 4, lineHeight: 18 },
  levelBadge:  { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', alignItems: 'center', justifyContent: 'center' },
  levelNum:    { fontSize: 18, fontWeight: '900', color: colors.amber },
  levelLbl:    { fontSize: 9, color: 'rgba(245,158,11,0.6)' },
  aaIdRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.violetDim, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  aaIdText:    { fontFamily: 'monospace', color: colors.violetLight, fontWeight: '700', fontSize: 14 },
  aaIdCopy:    { fontSize: 12, color: colors.white40 },
  goalRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white05, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  goalText:    { fontSize: 13, color: colors.white60 },
  levelLabel:  { fontSize: 12, color: colors.white40, textAlign: 'center' },
  statsRow:    { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard:    { flex: 1, alignItems: 'center', padding: 12 },
  statVal:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLbl:     { fontSize: 10, color: colors.white40, marginTop: 2 },
  barLabel:    { fontSize: 12, color: colors.white40 },
  barBg:       { height: 6, backgroundColor: colors.white10, borderRadius: 3 },
  barFill:     { height: 6, backgroundColor: colors.amber, borderRadius: 3 },
  formTitle:   { fontSize: 14, fontWeight: '700', color: colors.white60, marginBottom: 14 },
  fieldLabel:  { fontSize: 12, color: colors.white40, marginBottom: 6 },
  input:       { backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: '#fff', fontSize: 13 },
  msg:         { fontSize: 13, marginBottom: 8 },
  cancelBtn:   { flex: 1, backgroundColor: colors.white05, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  memberSince: { textAlign: 'center', color: colors.white20, fontSize: 11, marginTop: 20 },
});
