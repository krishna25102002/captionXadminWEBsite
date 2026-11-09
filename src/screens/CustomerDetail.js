import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import C, { inr, statusColor, fmtDateTime } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { getCustomerDetail, updateCustomer, deleteCustomer } from '../api.js';
import { Card, InfoRow, Badge, Loader, Avatar, EmptyState, Button, ConfirmDialog, EditModal } from '../components/UI.js';

const EDIT_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
];

const CustomerDetail = ({ id }) => {
  const { token } = useAuth();
  const { navigate, back } = useNav();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await getCustomerDetail(id, token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load customer');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading customer…" />;
  if (error)
    return (
      <Card>
        <Text style={{ color: C.danger }}>{error}</Text>
      </Card>
    );
  if (!data) return null;

  const c = data.customer;
  const bookings = data.bookings || [];

  const openEdit = () => {
    setEditValues({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
    });
    setEditing(true);
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await updateCustomer(id, editValues, token);
      setEditing(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not update customer');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteCustomer(id, token);
      setConfirmDelete(false);
      back();
    } catch (err) {
      setError(err.message || 'Could not delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View style={{ gap: 18, maxWidth: 960 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={c.name} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.sub}>
              {c.phone} {c.email ? `· ${c.email}` : ''}
            </Text>
          </View>
        </View>
        <InfoRow label="Member Since" value={fmtDateTime(c.createdAt)} />
        <InfoRow label="Bookings" value={bookings.length} last />
      </Card>

      <Card>
        <Text style={styles.section}>Booking History</Text>
        {!bookings.length ? (
          <EmptyState title="No bookings yet" />
        ) : (
          bookings.map((b) => {
            const driver = b.assignedDriverId;
            return (
              <Pressable
                key={b._id}
                onPress={() => navigate('booking-detail', { id: b._id })}
                style={({ hovered }) => [styles.row, hovered && { backgroundColor: C.surfaceAlt }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowMain}>{b.bookingNumber}</Text>
                  <Text style={styles.rowSub}>
                    {fmtDateTime(b.fromDate || b.createdAt)} · {driver?.fullName || 'No driver'}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Badge label={b.bookingStatus || '—'} color={statusColor(b.bookingStatus)} />
                  <Text style={styles.amount}>{inr(b.actualFare || b.estimatedFare)}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="✎  Edit Customer" variant="secondary" onPress={openEdit} style={{ flex: 1 }} />
        <Button title="🗑  Delete Customer" variant="danger" onPress={() => setConfirmDelete(true)} style={{ flex: 1 }} />
      </View>

      <EditModal
        visible={editing}
        title="Edit Customer"
        fields={EDIT_FIELDS}
        values={editValues}
        onChangeText={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
        onSave={doSave}
        onCancel={() => setEditing(false)}
        saving={saving}
      />
      <ConfirmDialog
        visible={confirmDelete}
        title="Delete Customer"
        message={`Delete ${c.name || 'this customer'} permanently? This removes their account from the database.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        loading={deleteLoading}
      />
    </View>
  );
};

export default CustomerDetail;

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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
  amount: {
    color: C.text,
    fontWeight: '700',
    fontSize: 14,
  },
});