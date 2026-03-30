import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { listRoadmaps, generateRoadmap } from '../api/api';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

export default function RoadmapScreen({ navigation }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState('steps');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listRoadmaps();
      const list = data.roadmaps || [];
      setRoadmaps(list);
      if (list.length > 0) setSelected(list[0]);
    } catch {} finally { setLoading(false); }
  };

  const rm = selected?.roadmap;
  const TABS = ['steps', 'skills', 'courses', 'timeline'];

  const renderContent = () => {
    if (!rm) return null;
    switch (tab) {
      case 'steps':
        return (rm.nextSteps || []).map((s, i) => (
          <GlassCard key={i} style={styles.item}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.step || i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{s.title}</Text>
              <Text style={styles.itemDesc}>{s.description}</Text>
              {s.duration ? <Text style={styles.tag}>⏱ {s.duration}</Text> : null}
            </View>
          </GlassCard>
        ));
      case 'skills':
        return (rm.skills || []).map((s, i) => (
          <GlassCard key={i} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{s.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <Text style={styles.tag}>{s.level}</Text>
                <Text style={[styles.tag, { color: s.priority === 'High' ? colors.red : colors.amber }]}>{s.priority}</Text>
              </View>
              {s.resources ? <Text style={styles.itemDesc}>{s.resources}</Text> : null}
            </View>
          </GlassCard>
        ));
      case 'courses':
        return (rm.courses || []).map((c, i) => (
          <GlassCard key={i} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{c.name}</Text>
              <Text style={styles.itemDesc}>{c.platform}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <Text style={styles.tag}>{c.cost}</Text>
                {c.duration ? <Text style={styles.tag}>{c.duration}</Text> : null}
              </View>
            </View>
          </GlassCard>
        ));
      case 'timeline':
        return (rm.timeline || []).map((t, i) => (
          <GlassCard key={i} style={styles.item}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{t.period}</Text>
              <Text style={styles.itemDesc}>{t.focus}</Text>
              {t.goal ? <Text style={[styles.tag, { color: colors.emerald }]}>🎯 {t.goal}</Text> : null}
            </View>
          </GlassCard>
        ));
      default: return null;
    }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>🗺️ Roadmap</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: 40 }} />
      ) : roadmaps.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🗺️</Text>
          <Text style={styles.emptyText}>No roadmap yet. Complete the Goal Chat first.</Text>
          <GradientButton title="Set Goal →" onPress={() => navigation.navigate('GoalChat')} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <FlatList
          data={renderContent()}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => item}
          ListHeaderComponent={() => (
            <View style={{ padding: 16 }}>
              {rm?.overview ? (
                <GlassCard style={{ marginBottom: 16 }}>
                  <Text style={styles.overview}>{rm.overview}</Text>
                </GlassCard>
              ) : null}
              <View style={styles.tabs}>
                {TABS.map(t => (
                  <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabActive]}>
                    <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  back:         { color: colors.white60, fontSize: 15 },
  title:        { fontSize: 18, fontWeight: '900', color: '#fff' },
  tabs:         { flexDirection: 'row', backgroundColor: colors.white05, borderRadius: 12, padding: 4, marginBottom: 4 },
  tabBtn:       { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: 'center' },
  tabActive:    { backgroundColor: colors.violet },
  tabText:      { color: colors.white40, fontWeight: '600', fontSize: 11, textTransform: 'capitalize' },
  tabTextActive:{ color: '#fff' },
  item:         { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum:      { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.violetDim, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText:  { color: colors.violetLight, fontWeight: '700', fontSize: 12 },
  itemTitle:    { fontSize: 14, fontWeight: '700', color: '#fff' },
  itemDesc:     { fontSize: 12, color: colors.white60, marginTop: 3, lineHeight: 18 },
  tag:          { fontSize: 11, color: colors.violetLight, backgroundColor: colors.violetDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  overview:     { fontSize: 13, color: colors.white60, lineHeight: 20 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyText:    { color: colors.white40, fontSize: 13, textAlign: 'center' },
});
