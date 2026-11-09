import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import C, { statusColor, inr, fmtDateTime } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { getAdminBookings, updateBooking, deleteBooking } from '../api.js';
import { FilterChips, SearchInput, Card, Badge, Avatar, Loader, EmptyState, RowActions, ConfirmDialog, EditModal } from '../components/UI.js';

const STATUS_FILTERS = ['All', 'PENDING', 'CONFIRMED', 'ONGOING', 'Completed', 'Cancelled', 'NO_DRIVER_AVAILABLE'];
const PAYMENT_FILTERS = ['All', 'Pending', 'Paid'];

const BOOKING_STATUS = ['Searching', 'Assigned', 'Accepted', 'Reached Pickup', 'Trip Started', 'Completed', 'Cancelled', 'PENDING', 'CONFIRMED', 'ONGOING', 'CANCELLED', 'EXPIRED', 'NO_DRIVER_AVAILABLE'];

const EDIT_FIELDS = [
  { key: 'tripType', label: 'Trip Type' },
  { key: 'pickupAddress', label: 'Pickup Address', multiline: true },
  { key: 'dropAddress', label: 'Drop Address', multiline: true },
  { key: 'fromDate', label: 'From Date (YYYY-MM-DD HH:MM)' },
  { key: 'toDate', label: 'To Date (YYYY-MM-DD HH:MM)' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'endTime', label: 'End Time' },
  { key: 'estimatedFare', label: 'Estimated Fare', keyboardType: 'decimal-pad' },
  { key: 'actualFare', label: 'Actual Fare', keyboardType: 'decimal-pad' },
  { key: 'driverEarning', label: 'Driver Earnings', keyboardType: 'decimal-pad' },
  { key: 'bookingStatus', label: 'Booking Status', type: 'select', options: BOOKING_STATUS },
  { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['Pending', 'Paid', 'Refunded'] },
  { key: 'cancelReason', label: 'Cancel Reason (optional)', multiline: true },
];

const Bookings = () => {
  const { token } = useAuth();
  const { navigate } = useNav();
  const [status, setStatus] = useState('All');
  const [payment, setPayment] = useState('All');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      const res = await getAdminBookings(
        { status, paymentStatus: payment, search: search.trim() },
        token
      );
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load bookings');
    } finally {
      setLoading(false);
    }
  }, [token, status, payment, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openEdit = (b) => {
    setEditValues({
      tripType: b.tripType || '',
      pickupAddress: b.pickupAddress || '',
      dropAddress: b.dropAddress || '',
      fromDate: b.fromDate ? fmtDateTime(b.fromDate) : '',
      toDate: b.toDate ? fmtDateTime(b.toDate) : '',
      startTime: b.startTime || '',
      endTime: b.endTime || '',
      estimatedFare: b.estimatedFare != null ? String(b.estimatedFare) : '',
      actualFare: b.actualFare != null ? String(b.actualFare) : '',
      driverEarning: b.driverEarning != null ? String(b.driverEarning) : '',
      bookingStatus: b.bookingStatus || 'PENDING',
      paymentStatus: b.paymentStatus || 'Pending',
      cancelReason: b.cancelReason || '',
    });
    setEditing(b);
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await updateBooking(editing._id, {
        ...editValues,
        estimatedFare: editValues.estimatedFare ? Number(editValues.estimatedFare) : undefined,
        actualFare: editValues.actualFare ? Number(editValues.actualFare) : undefined,
        driverEarning: editValues.driverEarning ? Number(editValues.driverEarning) : undefined,
      }, token);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message || 'Could not update booking');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteBooking(deleting._id, token);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err.message || 'Could not delete booking');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View>
      <View style={{ gap: 10, marginBottom: 16 }}>
        <FilterChips options={STATUS_FILTERS} value={status} onChange={setStatus} />
        <View style={styles.toolbar}>
          <FilterChips options={PAYMENT_FILTERS} value={payment} onChange={setPayment} />
          <SearchInput value={search} onChangeText={setSearch} placeholder="Search booking number…" />
        </View>
      </View>

      {!data && loading ? (
        <Loader label="Loading bookings…" />
      ) : error ? (
        <Card>
          <Text style={{ color: C.danger }}>{error}</Text>
        </Card>
      ) : !data?.bookings?.length ? (
        <Card>
          <EmptyState title="No bookings found" message="Try a different filter or search." />
        </Card>
      ) : (
        <View style={styles.table}>
          <View style={[styles.th, styles.rowLine]}>
            <Text style={[styles.thText, { flex: 1.6 }]}>Booking</Text>
            <Text style={[styles.thText, { flex: 1.4 }]}>Customer</Text>
            <Text style={[styles.thText, { flex: 1.3 }]}>Driver</Text>
            <Text style={[styles.thText, { flex: 1.2 }]}>Schedule</Text>
            <Text style={[styles.thText, { flex: 0.8 }]}>Status</Text>
            <Text style={[styles.thText, { flex: 0.8 }]}>Payment</Text>
            <Text style={[styles.thText, { flex: 0.8, textAlign: 'right' }]}>Fare</Text>
            <Text style={[styles.thText, { flex: 0.9, textAlign: 'center' }]}>Actions</Text>
          </View>
          {data.bookings.map((b) => {
            const driver = b.assignedDriverId || b.driverId;
            return (
              <View key={b._id} style={[styles.rowLine, { alignItems: 'center' }]}>
                <Pressable
                  onPress={() => navigate('booking-detail', { id: b._id })}
                  style={({ hovered }) => [styles.rowMain, hovered && { backgroundColor: C.surfaceAlt }]}
                >
                  <View style={{ flex: 1.6 }}>
                    <Text style={styles.cellStrong}>{b.bookingNumber}</Text>
                    <Text style={styles.cellSub}>{b.tripType || '—'}</Text>
                  </View>
                  <Text style={[styles.cell, { flex: 1.4 }]}>{b.customerId?.name || '—'}</Text>
                  <Text style={[styles.cell, { flex: 1.3 }]}>{driver?.fullName || '—'}</Text>
                  <Text style={[styles.cell, { flex: 1.2 }]}>
                    {fmtDateTime(b.fromDate || b.createdAt)}
                  </Text>
                  <View style={{ flex: 0.8 }}>
                    <Badge label={b.bookingStatus || '—'} color={statusColor(b.bookingStatus)} />
                  </View>
                  <View style={{ flex: 0.8 }}>
                    <Badge label={b.paymentStatus || 'Pending'} color={statusColor(b.paymentStatus)} />
                  </View>
                  <Text style={[styles.cell, styles.fare, { flex: 0.8, textAlign: 'right' }]}>
                    {inr(b.actualFare || b.estimatedFare)}
                  </Text>
                </Pressable>
                <View style={{ flex: 0.9, alignItems: 'center' }}>
                  <RowActions onEdit={() => openEdit(b)} onDelete={() => setDeleting(b)} />
                </View>
              </View>
            );
          })}
        </View>
      )}
      {data ? (
        <Text style={styles.meta}>
          Showing {data.count} of {data.total} bookings
        </Text>
      ) : null}

      <EditModal
        visible={!!editing}
        title="Edit Booking"
        fields={EDIT_FIELDS}
        values={editValues}
        onChangeText={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
        onSave={doSave}
        onCancel={() => setEditing(null)}
        saving={saving}
      />
      <ConfirmDialog
        visible={!!deleting}
        title="Delete Booking"
        message={`Delete booking ${deleting?.bookingNumber || ''}? This permanently removes it.`}
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
        loading={deleteLoading}
      />
    </View>
  );
};

export default Bookings;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  table: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  th: {
    backgroundColor: C.primarySoft,
  },
  thText: {
    color: C.textSub,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  rowMain: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 10,
    cursor: 'pointer',
  },
  cell: {
    color: C.textSub,
    fontSize: 13,
  },
  cellStrong: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
  },
  cellSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  fare: {
    color: C.text,
    fontWeight: '800',
  },
  meta: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
});