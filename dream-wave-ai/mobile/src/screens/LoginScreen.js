import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [mode, setMode]   = useState('email');
  const [form, setForm]   = useState({ email: '', aaId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const payload = mode === 'email'
        ? { email: form.email, password: form.password }
        : { aaId: form.aaId, password: form.password };
      const endpoint = mode === 'email' ? login : (d) => require('../api/api').default.post('/auth/login-aa', d);
      const { data } = await endpoint(payload);
      await saveAuth(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🌊</Text>
          <Text style={styles.title}>Dream Wave AI</Text>
          <Text style={styles.sub}>Sign in to your account</Text>

          {/* Mode toggle */}
          <View style={styles.toggle}>
            {['email', 'aa'].map(m => (
              <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.toggleBtn, mode === m && styles.toggleActive]}>
                <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                  {m === 'email' ? 'Email' : 'AA ID'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {mode === 'email' ? (
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.white40}
                value={form.email} onChangeText={v => set('email', v)}
                keyboardType="email-address" autoCapitalize="none" />
            ) : (
              <TextInput style={styles.input} placeholder="AA ID (e.g. AA123456)" placeholderTextColor={colors.white40}
                value={form.aaId} onChangeText={v => set('aaId', v)} autoCapitalize="characters" />
            )}
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.white40}
              value={form.password} onChangeText={v => set('password', v)} secureTextEntry />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <GradientButton title={loading ? 'Signing in...' : 'Sign In'} onPress={submit} disabled={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
              <Text style={styles.linkText}>No account? <Text style={styles.linkHighlight}>Create one</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll:           { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo:             { fontSize: 56, marginBottom: 12 },
  title:            { fontSize: 24, fontWeight: '900', color: '#fff' },
  sub:              { fontSize: 13, color: colors.white40, marginTop: 4, marginBottom: 28 },
  toggle:           { flexDirection: 'row', backgroundColor: colors.white05, borderRadius: 12, padding: 4, marginBottom: 20, width: '100%' },
  toggleBtn:        { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  toggleActive:     { backgroundColor: colors.violet },
  toggleText:       { color: colors.white40, fontWeight: '600', fontSize: 13 },
  toggleTextActive: { color: '#fff' },
  form:             { width: '100%', gap: 12 },
  input:            { backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: '#fff', fontSize: 14 },
  error:            { color: colors.red, fontSize: 13, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 10 },
  link:             { alignItems: 'center', marginTop: 16 },
  linkText:         { color: colors.white40, fontSize: 13 },
  linkHighlight:    { color: colors.violetLight, fontWeight: '700' },
});
