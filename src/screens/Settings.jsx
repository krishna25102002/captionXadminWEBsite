import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import C from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { Card, InfoRow, Avatar, Button } from '../components/UI.js';

const Settings = () => {
  const { admin, refreshProfile } = useAuth();
  const { setRoot } = useNav();

  return (
    <View style={{ gap: 18, maxWidth: 760 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <Avatar name={admin?.name || admin?.email} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{admin?.name || admin?.email}</Text>
            <Text style={styles.sub}>{admin?.role || 'Admin'}</Text>
          </View>
        </View>
        <InfoRow label="Email" value={admin?.email} last />
      </Card>

      <Card>
        <Text style={styles.section}>Platform</Text>
        <InfoRow label="Per-hour fare rate" value="Editable in Config" />
        <InfoRow label="Fees & GST" value="Editable in Config" />
        <InfoRow label="Payment gateway" value="Razorpay (test)" last />
      </Card>

      <Button title="Open Config" onPress={() => setRoot('config')} />
      <Button title="Refresh Profile" variant="secondary" onPress={() => refreshProfile()} />
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  name: {
    color: C.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sub: {
    color: C.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    color: C.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
});