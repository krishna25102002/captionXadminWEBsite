import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import C from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { Field, Button } from '../components/UI.js';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>D</Text>
          </View>
          <View>
            <Text style={styles.brandName}>DriveGo</Text>
            <Text style={styles.brandSub}>Admin Panel</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage driving trips, drivers & payments.</Text>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@drivergo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Sign In" onPress={handleLogin} loading={loading} />

        <Pressable style={styles.hintBtn} onPress={() => setEmail('admin@drivergo.com') && setPassword('Admin@123')}>
          <Text style={styles.hintText}>Demo: admin@drivergo.com / Admin@123</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primaryDark,
    minHeight: '100vh',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 28,
    ...C.shadow || {},
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandIconText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
  },
  brandName: {
    color: C.text,
    fontWeight: '800',
    fontSize: 20,
  },
  brandSub: {
    color: C.textMuted,
    fontSize: 13,
  },
  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: C.textMuted,
    fontSize: 14,
    marginBottom: 24,
  },
  error: {
    color: C.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  hintBtn: {
    marginTop: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  hintText: {
    color: C.textMuted,
    fontSize: 12,
  },
});