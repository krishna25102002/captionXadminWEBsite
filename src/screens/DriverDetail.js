import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import C, { statusColor, fmtDate, fmtDateTime } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import {
  getDriverDetail,
  approveDriver,
  rejectDriver,
  updateDriver,
  deleteDriver,
  API_BASE_URL,
} from '../api.js';
import {
  Card,
  InfoRow,
  Badge,
  Button,
  Loader,
  Avatar,
  Field,
  ConfirmDialog,
  EditModal,
} from '../components/UI.js';

const EDIT_FIELDS = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'mobileNumber', label: 'Mobile (login ID)', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'dateOfBirth', label: 'Date of Birth (YYYY-MM-DD)' },
  { key: 'address', label: 'Address', multiline: true },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'pincode', label: 'Pincode', keyboardType: 'number-pad' },
  { key: 'bloodGroup', label: 'Blood Group' },
  { key: 'emergencyContactName', label: 'Emergency Contact Name' },
  { key: 'emergencyContactNumber', label: 'Emergency Contact Number', keyboardType: 'phone-pad' },
  { key: 'experience', label: 'Experience (yrs)', keyboardType: 'number-pad' },
  { key: 'languages', label: 'Languages (comma separated)' },
  { key: 'rating', label: 'Rating', keyboardType: 'decimal-pad' },
  { key: 'totalTrips', label: 'Total Trips', keyboardType: 'number-pad' },
  { key: 'verificationStatus', label: 'Verification', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
  { key: 'accountStatus', label: 'Account Status', type: 'select', options: ['Offline', 'Online', 'Busy'] },
];

const DriverDetail = ({ id }) => {
  const { token } = useAuth();
  const { back } = useNav();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await getDriverDetail(id, token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load driver');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading driver…" />;
  if (error)
    return (
      <Card>
        <Text style={{ color: C.danger }}>{error}</Text>
      </Card>
    );
  if (!data) return null;

  const d = data.driver;
  const docs = data.documents || {};

  const docUrl = (u) =>
    u && /^https?:\/\//.test(u) ? u : `${API_BASE_URL}/${u || ''}`;

  const doApprove = async () => {
    setActionLoading(true);
    try {
      await approveDriver(id, token);
      Alert.alert('Approved', 'Driver approved successfully.');
      load();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not approve driver');
    } finally {
      setActionLoading(false);
    }
  };

  const doReject = async () => {
    setActionLoading(true);
    try {
      await rejectDriver(id, remarks.trim(), token);
      Alert.alert('Rejected', 'Driver has been rejected.');
      setShowReject(false);
      setRemarks('');
      load();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not reject driver');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = () => {
    setEditValues({
      fullName: d.fullName || '',
      email: d.email || '',
      mobileNumber: d.mobileNumber || '',
      gender: d.gender || '',
      dateOfBirth: d.dateOfBirth ? String(d.dateOfBirth).slice(0, 10) : '',
      address: d.address || '',
      city: d.city || '',
      state: d.state || '',
      pincode: d.pincode || '',
      bloodGroup: d.bloodGroup || '',
      emergencyContactName: d.emergencyContactName || '',
      emergencyContactNumber: d.emergencyContactNumber || '',
      experience: d.experience != null ? String(d.experience) : '',
      languages: (d.languages || []).join(', '),
      rating: d.rating != null ? String(d.rating) : '',
      totalTrips: d.totalTrips != null ? String(d.totalTrips) : '',
      verificationStatus: d.verificationStatus || 'Pending',
      accountStatus: d.accountStatus || 'Offline',
    });
    setEditing(true);
  };

  const doSaveEdit = async () => {
    setSaving(true);
    try {
      await updateDriver(id, {
        ...editValues,
        languages: editValues.languages,
        experience: editValues.experience ? Number(editValues.experience) : undefined,
        rating: editValues.rating ? Number(editValues.rating) : undefined,
        totalTrips: editValues.totalTrips ? Number(editValues.totalTrips) : undefined,
        dateOfBirth: editValues.dateOfBirth || undefined,
      }, token);
      setEditing(false);
      Alert.alert('Saved', 'Driver updated successfully.');
      load();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update driver');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteDriver(id, token);
      setConfirmDelete(false);
      Alert.alert('Deleted', 'Driver deleted successfully.');
      back();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not delete driver');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View style={{ gap: 18, maxWidth: 900 }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={d.fullName} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{d.fullName}</Text>
          <Text style={styles.sub}>{d.email || 'No email'} · {d.mobileNumber}</Text>
        </View>
        <Badge label={d.verificationStatus || '—'} color={statusColor(d.verificationStatus)} />
        <Badge label={d.accountStatus || 'Offline'} color={statusColor(d.accountStatus)} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
        <Card style={{ flex: 1, minWidth: 300 }}>
          <Text style={styles.section}>Driver Profile</Text>
          <InfoRow label="Gender" value={d.gender} />
          <InfoRow label="Date of Birth" value={fmtDate(d.dateOfBirth)} />
          <InfoRow label="Address" value={d.address} />
          <InfoRow label="City" value={d.city} />
          <InfoRow label="State" value={d.state} />
          <InfoRow label="Pincode" value={d.pincode} />
          <InfoRow label="Experience" value={d.experience ? `${d.experience} yrs` : '—'} />
          <InfoRow label="Languages" value={d.languages?.length ? d.languages.join(', ') : '—'} />
        </Card>

        <Card style={{ flex: 1, minWidth: 300 }}>
          <Text style={styles.section}>Emergency & Vehicle</Text>
          <InfoRow label="Emergency Contact" value={d.emergencyContactName} />
          <InfoRow label="Emergency Number" value={d.emergencyContactNumber} />
          <InfoRow label="Blood Group" value={d.bloodGroup} />
          <InfoRow label="Rating" value={d.rating != null ? `${d.rating} ★` : '—'} />
          <InfoRow
            label="Ratings Count"
            value={(d.ratingCount ?? 0) > 0 ? `${d.ratingCount} received` : 'Not rated yet'}
          />
          <InfoRow label="Total Trips" value={d.totalTrips ?? 0} />
          <InfoRow label="Profile Completed" value={d.isProfileCompleted ? 'Yes' : 'No'} />
          <InfoRow label="Joined" value={fmtDateTime(d.createdAt)} />
        </Card>
      </View>

      <Card>
        <Text style={styles.section}>Documents</Text>
        {[
          ['Profile Photo', docs.profilePhoto],
          ['Aadhaar Front', docs.aadhaarFront],
          ['Aadhaar Back', docs.aadhaarBack],
          ['License Front', docs.licenseFront],
          ['License Back', docs.licenseBack],
          ['Selfie', docs.selfie],
          ['Vehicle RC', docs.vehicleRc],
        ].map(([label, url]) =>
          url ? (
            <View key={label} style={styles.docRow}>
              <Text style={styles.docLabel}>{label}</Text>
              <a href={docUrl(url)} target="_blank" rel="noreferrer" style={styles.docLink}>
                Open image ↗
              </a>
            </View>
          ) : (
            <View key={label} style={styles.docRow}>
              <Text style={styles.docLabel}>{label}</Text>
              <Text style={{ color: C.textMuted }}>Not uploaded</Text>
            </View>
          )
        )}
        {docs.status ? (
          <View style={{ marginTop: 8 }}>
            <InfoRow label="Document Status" value={docs.status} />
            <InfoRow label="Remarks" value={docs.remarks} />
            <InfoRow label="Verified At" value={fmtDateTime(docs.verifiedAt)} last />
          </View>
        ) : null}
      </Card>

      {!showReject ? (
        <View style={styles.actions}>
          <Button title="Approve Driver" variant="success" onPress={doApprove} loading={actionLoading} style={{ flex: 1 }} />
          <Button title="Reject" variant="danger" onPress={() => setShowReject(true)} style={{ flex: 1 }} />
        </View>
      ) : (
        <Card>
          <Text style={styles.section}>Reject Driver</Text>
          <Field
            label="Remarks (shown to driver)"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            placeholder="e.g. License documents unclear…"
          />
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowReject(false)} />
            <Button title="Confirm Reject" variant="danger" onPress={doReject} loading={actionLoading} />
          </View>
        </Card>
      )}

      <View style={styles.actions}>
        <Button title="✎  Edit Driver" variant="secondary" onPress={openEdit} style={{ flex: 1 }} />
        <Button title="🗑  Delete Driver" variant="danger" onPress={() => setConfirmDelete(true)} style={{ flex: 1 }} />
      </View>

      <EditModal
        visible={editing}
        title="Edit Driver"
        fields={EDIT_FIELDS}
        values={editValues}
        onChangeText={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
        onSave={doSaveEdit}
        onCancel={() => setEditing(false)}
        saving={saving}
      />
      <ConfirmDialog
        visible={confirmDelete}
        title="Delete Driver"
        message={`Delete ${d.fullName || 'this driver'} permanently? This removes their account and documents from the database.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        loading={deleteLoading}
      />
    </View>
  );
};

export default DriverDetail;

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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  docLabel: {
    color: C.textSub,
    fontWeight: '600',
    fontSize: 13,
  },
  docLink: {
    color: C.accent,
    fontWeight: '600',
    fontSize: 13,
  },
});