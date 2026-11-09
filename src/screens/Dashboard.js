import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import C, { num, inr, fmtDateTime, statusColor } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { getDashboard } from '../api.js';
import { StatCard, Card, Badge, Loader, SectionTitle, Avatar } from '../components/UI.js';

const Dashboard = () => {
  const { token } = useAuth();
  const { navigate } = useNav();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await getDashboard(token);
      setData(res.dashboard);
    } catch (err) {
      setError(err.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading dashboard…" />;
  if (error)
    return (
      <Card>
        <Text style={{ color: C.danger }}>{error}</Text>
      </Card>
    );
  if (!data) return null;

  const d = data;
  const rev = d.revenue || {};

  return (
    <View style={{ gap: 22 }}>
      <View style={styles.statRow}>
        <StatCard label="Customers" value={num(d.customers)} icon="☻" tint={C.info} />
        <StatCard label="Drivers" value={num(d.drivers)} icon="☰" tint={C.primary} />
        <StatCard
          label="Pending Approvals"
          value={num(d.pendingDrivers)}
          icon="!"
          tint={C.pending}
          sub={d.pendingDrivers > 0 ? 'Needs action' : 'All clear'}
        />
        <StatCard label="Active Bookings" value={num((d.bookingStats || {}).active)} icon="▤" tint={C.accent} />
      </View>

      <View style={styles.statRow}>
        <StatCard label="Gross Revenue" value={inr(rev.total?.gross)} icon="₹" tint={C.success} sub={`${num(rev.total?.trips)} completed trips`} />
        <StatCard label="Paid (Collected)" value={inr(rev.paid?.gross)} icon="✓" tint={C.info} sub={`${num(rev.paid?.trips)} trips paid`} />
        <StatCard label="Driver Payout" value={inr(rev.total?.driver)} icon="◉" tint={C.warning} sub="Drivers' earnings" />
        <StatCard label="Platform Income" value={inr(rev.total?.platform)} icon="₹" tint={C.accent} sub="Fees + GST" />
      </View>

      <View style={styles.statRow}>
        <StatCard label="This Week" value={inr(rev.thisWeek?.gross)} icon="▤" tint={C.primary} sub={`${num(rev.thisWeek?.trips)} trips`} />
        <StatCard label="This Month" value={inr(rev.thisMonth?.gross)} icon="▦" tint={C.primary} sub={`${num(rev.thisMonth?.trips)} trips`} />
        <StatCard label="Completed" value={num(d.bookingStats?.completed)} icon="✓" tint={C.success} />
        <StatCard label="Cancelled" value={num(d.bookingStats?.cancelled)} icon="×" tint={C.danger} />
      </View>

      <Card>
        <SectionTitle
          title="Recent Bookings"
          action={
            <Pressable onPress={() => navigate('bookings')}>
              <Text style={{ color: C.accent, fontWeight: '700', fontSize: 13 }}>View all →</Text>
            </Pressable>
          }
        />
        {(d.recentBookings || []).map((b) => (
          <Pressable
            key={b._id}
            onPress={() => navigate('booking-detail', { id: b._id })}
            style={({ hovered }) => [styles.row, hovered && { backgroundColor: C.surfaceAlt }]}
          >
            <Avatar name={b.customerId?.name} size={34} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowMain}>{b.customerId?.name || 'Customer'}</Text>
              <Text style={styles.rowSub}>
                {b.bookingNumber} · {fmtDateTime(b.createdAt || b.completedAt)}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Badge label={b.bookingStatus || '—'} color={statusColor(b.bookingStatus)} />
              <Text style={styles.rowAmount}>{inr(b.actualFare || b.estimatedFare)}</Text>
            </View>
          </Pressable>
        ))}
        {!(d.recentBookings || []).length ? (
          <Text style={{ color: C.textMuted, textAlign: 'center', paddingVertical: 20 }}>
            No bookings yet.
          </Text>
        ) : null}
      </Card>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    cursor: 'pointer',
  },
  rowMain: {
    color: C.text,
    fontWeight: '700',
    fontSize: 14,
  },
  rowSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowAmount: {
    color: C.text,
    fontWeight: '700',
    fontSize: 14,
  },
});