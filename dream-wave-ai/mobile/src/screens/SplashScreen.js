import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, colors } from '../theme/colors';

export default function SplashScreen({ onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 5,   useNativeDriver: true }),
    ]).start(() => {
      setTimeout(onDone, 1200);
    });
  }, []);

  return (
    <LinearGradient colors={gradients.bg} style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <Text style={styles.logo}>🌊</Text>
        <Text style={styles.title}>Dream Wave AI</Text>
        <Text style={styles.sub}>Your AI Career Guide</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo:      { fontSize: 72, marginBottom: 16 },
  title:     { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  sub:       { fontSize: 14, color: colors.white40, marginTop: 6 },
});
