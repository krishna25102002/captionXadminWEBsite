import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import C, { statusColor, inr, fmtDateTime } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { getBookingDetail, updateBooking, deleteBooking } from '../api.js';
import { Card, InfoRow, Badge, Loader, Avatar, Button, ConfirmDialog, EditModal } from '../components/UI.js';

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

const BookingDetail = ({ id }) => {
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
      const res = await getBookingDetail(id, token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load booking');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading booking…" />;
  if (error)
    return (
      <Card>
        <Text style={{ color: C.danger }}>{error}</Text>
      </Card>
    );
  if (!data) return null;

  const b = data.booking;
  const driver = b.assignedDriverId || b.driverId;
  const fb = b.fareBreakup || {};
  const custVehicle = b.customerVehicleId;
  const total = b.actualFare || fb.total || b.estimatedFare || 0;

  const openEdit = () => {
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
    setEditing(true);
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await updateBooking(id, {
        ...editValues,
        estimatedFare: editValues.estimatedFare ? Number(editValues.estimatedFare) : undefined,
        actualFare: editValues.actualFare ? Number(editValues.actualFare) : undefined,
        driverEarning: editValues.driverEarning ? Number(editValues.driverEarning) : undefined,
      }, token);
      setEditing(false);
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
      await deleteBooking(id, token);
      setConfirmDelete(false);
      back();
    } catch (err) {
      setError(err.message || 'Could not delete booking');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View style={{ gap: 18, maxWidth: 960 }}>
      <Card>
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.number}>{b.bookingNumber}</Text>
            <Text style={styles.sub}>{b.tripType || 'Trip'} · Created {fmtDateTime(b.createdAt)}</Text>
          </View>
          <Badge label={b.bookingStatus || '—'} color={statusColor(b.bookingStatus)} />
          <Badge label={b.paymentStatus || 'Pending'} color={statusColor(b.paymentStatus)} />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
        <Card style={{ flex: 1, minWidth: 300 }}>
          <Text style={styles.section}>Customer</Text>
          {b.customerId ? (
            <Pressable
              onPress={() => navigate('customer-detail', { id: b.customerId._id })}
              style={({ hovered }) => [styles.avatarRow, hovered && { backgroundColor: C.surfaceAlt, borderRadius: 12 }]}
            >
              <Avatar name={b.customerId.name} size={38} />
              <View>
                <Text style={styles.strong}>{b.customerId.name}</Text>
                <Text style={styles.sub}>{b.customerId.phone}</Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </Pressable>
          ) : null}
          <InfoRow label="Email" value={b.customerId?.email} />
          <InfoRow label="Cust. Vehicle" value={custVehicle ? `${custVehicle.brand} ${custVehicle.model}` : '—'} />
          <InfoRow label="Vehicle No." value={custVehicle?.vehicleNumber} last />
        </Card>

        <Card style={{ flex: 1, minWidth: 300 }}>
          <Text style={styles.section}>Assigned Driver</Text>
          {driver ? (
            <Pressable
              onPress={() => navigate('driver-detail', { id: driver._id })}
              style={({ hovered }) => [styles.avatarRow, hovered && { backgroundColor: C.surfaceAlt, borderRadius: 12 }]}
            >
              <Avatar name={driver.fullName} size={38} />
              <View>
                <Text style={styles.strong}>{driver.fullName}</Text>
                <Text style={styles.sub}>{driver.mobileNumber}</Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </Pressable>
          ) : (
            <Text style={{ color: C.textMuted }}>No driver assigned</Text>
          )}
          <InfoRow label="Driver City" value={driver?.city} />
          <InfoRow label="Verified" value={driver?.verificationStatus} />
          <InfoRow
            label="Drivers Requested"
            value={b.requestedDriverIds?.length ? `${b.requestedDriverIds.length} driver(s)` : '—'}
            last
          />
        </Card>
      </View>

      <Card>
        <Text style={styles.section}>Trip Schedule</Text>
        <InfoRow label="From Date" value={fmtDateTime(b.fromDate)} />
        <InfoRow label="To Date" value={fmtDateTime(b.toDate)} />
        <InfoRow label="Start Time" value={b.startTime} />
        <InfoRow label="End Time" value={b.endTime} />
        <InfoRow label="Pickup" value={b.pickupAddress} />
        <InfoRow label="Drop" value={b.dropAddress} />
        <InfoRow label="Started" value={fmtDateTime(b.startedAt)} />
        <InfoRow label="Completed" value={fmtDateTime(b.completedAt)} last />
      </Card>

      <Card>
        <Text style={styles.section}>Fare</Text>
        {fb.billableHours > 0 || b.actualFare > 0 ? (
          <>
            <InfoRow label="Billable Hours" value={fb.billableHours ? `${fb.billableHours} hrs` : '—'} />
            <InfoRow label="Base Fare" value={inr(fb.baseFare)} />
            <InfoRow label="Platform Fee" value={inr(fb.platformFee)} />
            <InfoRow label="GST (18%)" value={inr(fb.taxGst)} />
            <InfoRow label="Rate / hr" value={fb.perHourRate ? inr(fb.perHourRate) : '—'} />
          </>
        ) : (
          <InfoRow label="Estimated Fare" value={inr(b.estimatedFare)} />
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total {b.paymentStatus === 'Paid' ? '(Paid)' : ''}</Text>
          <Text style={styles.totalValue}>{inr(total)}</Text>
        </View>
        <InfoRow label="Driver Earnings" value={inr(b.driverEarning)} />
        <InfoRow label="Platform Income" value={inr((fb.platformFee || 0) + (fb.taxGst || 0))} last />
      </Card>

      {b.cancelReason ? (
        <Card>
          <Text style={styles.section}>Cancellation</Text>
          <InfoRow label="Reason" value={b.cancelReason} />
          <InfoRow label="Cancelled By" value={b.cancelledBy} />
          <InfoRow label="Cancelled At" value={fmtDateTime(b.cancelledAt)} last />
        </Card>
      ) : null}

      <Card>
        <Text style={styles.section}>OTP & Payment Ref</Text>
        <InfoRow label="Start OTP" value={b.startOtp ? (b.startOtpVerified ? 'Used ✓' : b.startOtp) : 'Not generated'} />
        <InfoRow label="End OTP" value={b.endOtp ? (b.endOtpVerified ? 'Used ✓' : b.endOtp) : 'Not generated'} />
        <InfoRow label="Payment Link ID" value={b.paymentLinkId} />
        <InfoRow label="Gateway ID" value={b.paymentGatewayId} />
        <InfoRow label="Order ID" value={b.paymentOrderId} last />
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="✎  Edit Booking" variant="secondary" onPress={openEdit} style={{ flex: 1 }} />
        <Button title="🗑  Delete Booking" variant="danger" onPress={() => setConfirmDelete(true)} style={{ flex: 1 }} />
      </View>

      <EditModal
        visible={editing}
        title="Edit Booking"
        fields={EDIT_FIELDS}
        values={editValues}
        onChangeText={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
        onSave={doSave}
        onCancel={() => setEditing(false)}
        saving={saving}
      />
      <ConfirmDialog
        visible={confirmDelete}
        title="Delete Booking"
        message={`Delete booking ${b.bookingNumber || ''}? This permanently removes it.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        loading={deleteLoading}
      />
    </View>
  );
};

export default BookingDetail;

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  number: {
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  strong: {
    color: C.text,
    fontWeight: '700',
    fontSize: 15,
  },
  linkArrow: {
    color: C.accent,
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  totalLabel: {
    color: C.text,
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: C.accent,
    fontSize: 22,
    fontWeight: '800',
  },
});