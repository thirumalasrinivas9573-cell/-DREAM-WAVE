import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { register } from '../api/api';
import { useAuth } from '../context/AuthContext';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await register({ name: form.name, email: form.email, password: form.password });
      await saveAuth(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🌊</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Join Dream Wave AI</Text>

          <View style={styles.form}>
            {[
              { key: 'name',     placeholder: 'Full Name',        secure: false, keyboard: 'default' },
              { key: 'email',    placeholder: 'Email',            secure: false, keyboard: 'email-address' },
              { key: 'password', placeholder: 'Password (min 6)', secure: true,  keyboard: 'default' },
              { key: 'confirm',  placeholder: 'Confirm Password', secure: true,  keyboard: 'default' },
            ].map(f => (
              <TextInput key={f.key} style={styles.input}
                placeholder={f.placeholder} placeholderTextColor={colors.white40}
                value={form[f.key]} onChangeText={v => set(f.key, v)}
                secureTextEntry={f.secure} keyboardType={f.keyboard}
                autoCapitalize={f.key === 'name' ? 'words' : 'none'} />
            ))}

            {!!error && <Text style={styles.error}>{error}</Text>}

            <GradientButton title={loading ? 'Creating...' : 'Create Account'} onPress={submit} disabled={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkHighlight}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll:        { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo:          { fontSize: 56, marginBottom: 12 },
  title:         { fontSize: 24, fontWeight: '900', color: '#fff' },
  sub:           { fontSize: 13, color: colors.white40, marginTop: 4, marginBottom: 28 },
  form:          { width: '100%', gap: 12 },
  input:         { backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: '#fff', fontSize: 14 },
  error:         { color: colors.red, fontSize: 13, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 10 },
  link:          { alignItems: 'center', marginTop: 16 },
  linkText:      { color: colors.white40, fontSize: 13 },
  linkHighlight: { color: colors.violetLight, fontWeight: '700' },
});
