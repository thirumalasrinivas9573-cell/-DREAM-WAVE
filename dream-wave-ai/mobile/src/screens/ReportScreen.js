import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { listReports, generateReport, BASE_URL } from '../api/api';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

const STEPS = ['Analyzing goal...', 'Researching industry...', 'Gathering data...', 'Writing sections...', 'Generating PDF...', 'Done!'];

export default function ReportScreen({ navigation }) {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genStep, setGenStep]   = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await listReports(); setReports(data.reports || []); }
    catch {} finally { setLoading(false); }
  };

  const generate = async () => {
    setGenLoading(true); setGenStep(0);
    const interval = setInterval(() => setGenStep(s => Math.min(s + 1, STEPS.length - 2)), 3000);
    try {
      const { data } = await generateReport();
      clearInterval(interval); setGenStep(STEPS.length - 1);
      setReports(p => [data.report, ...p]);
      setTimeout(() => setGenLoading(false), 1000);
    } catch {
      clearInterval(interval); setGenLoading(false);
    }
  };

  const download = (url) => {
    const full = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    Linking.openURL(full);
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>📊 R&D Report</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={r => r._id}
        ListHeaderComponent={() => (
          <View style={{ padding: 16 }}>
            {genLoading ? (
              <GlassCard style={styles.genCard}>
                <ActivityIndicator color={colors.violet} style={{ marginBottom: 12 }} />
                <Text style={styles.genStep}>{STEPS[genStep]}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${((genStep + 1) / STEPS.length) * 100}%` }]} />
                </View>
              </GlassCard>
            ) : (
              <GradientButton title="✨ Generate New Report" onPress={generate} style={{ marginBottom: 16 }} />
            )}
            {loading && <ActivityIndicator color={colors.violet} />}
            {reports.length > 0 && <Text style={styles.sectionLabel}>YOUR REPORTS</Text>}
          </View>
        )}
        renderItem={({ item }) => (
          <GlassCard style={styles.reportCard}>
            <Text style={styles.reportGoal}>🎯 {item.goal || 'Career Report'}</Text>
            <Text style={styles.reportDate}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            {item.reportUrl ? (
              <TouchableOpacity onPress={() => download(item.reportUrl)} style={styles.downloadBtn}>
                <LinearGradient colors={gradients.primary} style={styles.downloadGrad}>
                  <Text style={styles.downloadText}>📥 Download PDF</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </GlassCard>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}
        ListEmptyComponent={!loading && !genLoading ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📊</Text>
            <Text style={styles.emptyText}>No reports yet. Generate your first one!</Text>
          </View>
        ) : null}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  back:         { color: colors.white60, fontSize: 15 },
  title:        { fontSize: 18, fontWeight: '900', color: '#fff' },
  genCard:      { alignItems: 'center', padding: 24, marginBottom: 16 },
  genStep:      { color: colors.violetLight, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  barBg:        { width: '100%', height: 6, backgroundColor: colors.white10, borderRadius: 3 },
  barFill:      { height: 6, backgroundColor: colors.violet, borderRadius: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.white40, letterSpacing: 1, marginBottom: 8 },
  reportCard:   {},
  reportGoal:   { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  reportDate:   { fontSize: 12, color: colors.white40, marginBottom: 12 },
  downloadBtn:  { borderRadius: 12, overflow: 'hidden' },
  downloadGrad: { paddingVertical: 10, alignItems: 'center' },
  downloadText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty:        { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText:    { color: colors.white40, fontSize: 13, textAlign: 'center' },
});
