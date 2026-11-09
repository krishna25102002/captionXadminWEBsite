import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import C from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { getAdminConfig, updateAdminConfig } from '../api.js';
import { Card, Field, Button, Loader } from '../components/UI.js';

const Config = () => {
  const { token } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getAdminConfig(token);
      setConfig(res.config || {});
    } catch (err) {
      setError(err.message || 'Could not load config');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (value) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const save = async () => {
    if (!config) return;
    setMsg('');
    setSaving(true);
    try {
      const numeric = {
        actingDriverPerHourRate: Number(config.actingDriverPerHourRate),
        maxDriversPerBooking: Number(config.maxDriversPerBooking),
        requestExpiryMinutes: Number(config.requestExpiryMinutes),
        platformFeePercent: Number(config.platformFeePercent),
        platformFeeMinAmount: Number(config.platformFeeMinAmount),
        gstPercent: Number(config.gstPercent),
        driverCancellationLimit: Number(config.driverCancellationLimit),
        driverCancellationWindowHours: Number(config.driverCancellationWindowHours),
        driverCancellationRestrictionHours: Number(config.driverCancellationRestrictionHours),
      };
      await updateAdminConfig(numeric, token);
      setMsg('Configuration saved. New rules apply to new trips.');
    } catch (err) {
      setError(err.message || 'Could not save config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading configuration…" />;
  if (error && !config)
    return (
      <Card>
        <Text style={{ color: C.danger }}>{error}</Text>
      </Card>
    );
  if (!config) return null;

  return (
    <View style={{ gap: 18, maxWidth: 760 }}>
      <Card>
        <Text style={styles.section}>Acting Driver Pricing</Text>
        <Field
          label="Per-hour rate (₹)"
          value={String(config.actingDriverPerHourRate ?? '')}
          onChangeText={set('actingDriverPerHourRate')}
          keyboardType="numeric"
        />
        <Field
          label="Max drivers per booking (1–10)"
          value={String(config.maxDriversPerBooking ?? '')}
          onChangeText={set('maxDriversPerBooking')}
          keyboardType="numeric"
        />
        <Field
          label="Request expiry (minutes)"
          value={String(config.requestExpiryMinutes ?? '')}
          onChangeText={set('requestExpiryMinutes')}
          keyboardType="numeric"
        />
      </Card>

      <Card>
        <Text style={styles.section}>Fees & Tax</Text>
        <Field
          label="Platform fee %"
          value={String(config.platformFeePercent ?? '')}
          onChangeText={set('platformFeePercent')}
          keyboardType="numeric"
        />
        <Field
          label="Platform minimum fee (₹)"
          value={String(config.platformFeeMinAmount ?? '')}
          onChangeText={set('platformFeeMinAmount')}
          keyboardType="numeric"
        />
        <Field
          label="GST %"
          value={String(config.gstPercent ?? '')}
          onChangeText={set('gstPercent')}
          keyboardType="numeric"
        />
      </Card>

      <Card>
        <Text style={styles.section}>Driver Skip / Cancellation Policy</Text>
        <Field
          label="Allowed skips/cancels (limit)"
          value={String(config.driverCancellationLimit ?? '')}
          onChangeText={set('driverCancellationLimit')}
          keyboardType="numeric"
        />
        <Field
          label="Counting window (hours)"
          value={String(config.driverCancellationWindowHours ?? '')}
          onChangeText={set('driverCancellationWindowHours')}
          keyboardType="numeric"
        />
        <Field
          label="Restriction duration (hours)"
          value={String(config.driverCancellationRestrictionHours ?? '')}
          onChangeText={set('driverCancellationRestrictionHours')}
          keyboardType="numeric"
        />
      </Card>

      {error ? <Text style={{ color: C.danger }}>{error}</Text> : null}
      {msg ? <Text style={{ color: C.success }}>{msg}</Text> : null}

      <Button title="Save Configuration" onPress={save} loading={saving} />
    </View>
  );
};

export default Config;

const styles = StyleSheet.create({
  section: {
    color: C.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
});