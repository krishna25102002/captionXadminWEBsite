import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import C, { statusColor, fmtDate } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { getAdminDrivers, updateDriver, deleteDriver } from '../api.js';
import { FilterChips, SearchInput, Card, Badge, Avatar, Loader, EmptyState, RowActions, ConfirmDialog, EditModal } from '../components/UI.js';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Online', 'Offline'];

const EDIT_FIELDS = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'mobileNumber', label: 'Mobile (login ID)', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'pincode', label: 'Pincode', keyboardType: 'number-pad' },
  { key: 'experience', label: 'Experience (yrs)', keyboardType: 'number-pad' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'verificationStatus', label: 'Verification', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
  { key: 'accountStatus', label: 'Account Status', type: 'select', options: ['Offline', 'Online', 'Busy'] },
];

const Drivers = () => {
  const { token } = useAuth();
  const { navigate } = useNav();
  const [status, setStatus] = useState('All');
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
      const res = await getAdminDrivers({ status, search: search.trim() }, token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load drivers');
    } finally {
      setLoading(false);
    }
  }, [token, status, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openEdit = (d) => {
    setEditValues({
      fullName: d.fullName || '',
      mobileNumber: d.mobileNumber || '',
      email: d.email || '',
      city: d.city || '',
      state: d.state || '',
      pincode: d.pincode || '',
      experience: d.experience != null ? String(d.experience) : '',
      gender: d.gender || '',
      verificationStatus: d.verificationStatus || 'Pending',
      accountStatus: d.accountStatus || 'Offline',
    });
    setEditing(d);
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await updateDriver(editing._id, {
        fullName: editValues.fullName,
        mobileNumber: editValues.mobileNumber,
        email: editValues.email,
        city: editValues.city,
        state: editValues.state,
        pincode: editValues.pincode,
        experience: editValues.experience,
        gender: editValues.gender,
        verificationStatus: editValues.verificationStatus,
        accountStatus: editValues.accountStatus,
      }, token);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message || 'Could not update driver');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteDriver(deleting._id, token);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err.message || 'Could not delete driver');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.toolbar}>
        <FilterChips options={FILTERS} value={status} onChange={setStatus} />
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search name or phone…" />
      </View>

      {!data && loading ? (
        <Loader label="Loading drivers…" />
      ) : error ? (
        <Card>
          <Text style={{ color: C.danger }}>{error}</Text>
        </Card>
      ) : !data?.drivers?.length ? (
        <Card>
          <EmptyState title="No drivers found" message="Try a different filter or search." />
        </Card>
      ) : (
        <View style={styles.table}>
          <View style={[styles.th, styles.rowLine]}>
            <Text style={[styles.thText, { flex: 2 }]}>Driver</Text>
            <Text style={[styles.thText, { flex: 1.4 }]}>Mobile</Text>
            <Text style={[styles.thText, { flex: 1 }]}>City</Text>
            <Text style={[styles.thText, { flex: 1 }]}>Verification</Text>
            <Text style={[styles.thText, { flex: 1 }]}>Status</Text>
            <Text style={[styles.thText, { flex: 0.7, textAlign: 'right' }]}>Trips</Text>
            <Text style={[styles.thText, { flex: 0.8, textAlign: 'right' }]}>Rating</Text>
            <Text style={[styles.thText, { flex: 0.9, textAlign: 'center' }]}>Actions</Text>
          </View>
          {data.drivers.map((d) => (
            <View key={d._id} style={[styles.rowLine, { alignItems: 'center' }]}>
              <Pressable
                onPress={() => navigate('driver-detail', { id: d._id })}
                style={({ hovered }) => [styles.rowMain, hovered && { backgroundColor: C.surfaceAlt }]}
              >
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar name={d.fullName} size={32} />
                  <Text style={styles.cellStrong}>{d.fullName || '—'}</Text>
                </View>
                <Text style={[styles.cell, { flex: 1.4 }]}>{d.mobileNumber || '—'}</Text>
                <Text style={[styles.cell, { flex: 1 }]}>{d.city || '—'}</Text>
                <View style={{ flex: 1 }}>
                  <Badge label={d.verificationStatus || '—'} color={statusColor(d.verificationStatus)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Badge label={d.accountStatus || 'Offline'} color={statusColor(d.accountStatus)} />
                </View>
                <Text style={[styles.cell, { flex: 0.7, textAlign: 'right' }]}>{d.totalTrips ?? 0}</Text>
                <Text style={[styles.cell, { flex: 0.8, textAlign: 'right' }]}>
                  {d.rating != null
                    ? `${Number(d.rating).toFixed(1)} ★ · ${d.ratingCount ?? 0}`
                    : '—'}
                </Text>
              </Pressable>
              <View style={{ flex: 0.9, alignItems: 'center' }}>
                <RowActions onEdit={() => openEdit(d)} onDelete={() => setDeleting(d)} />
              </View>
            </View>
          ))}
        </View>
      )}
      {data ? (
        <Text style={styles.meta}>
          Showing {data.count} of {data.total} drivers
        </Text>
      ) : null}

      <EditModal
        visible={!!editing}
        title="Edit Driver"
        fields={EDIT_FIELDS}
        values={editValues}
        onChangeText={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
        onSave={doSave}
        onCancel={() => setEditing(null)}
        saving={saving}
      />
      <ConfirmDialog
        visible={!!deleting}
        title="Delete Driver"
        message={`Delete ${deleting?.fullName || 'this driver'} permanently? This removes their account and documents from the database.`}
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
        loading={deleteLoading}
      />
    </View>
  );
};

export default Drivers;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  rowMain: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  cell: {
    color: C.textSub,
    fontSize: 13,
  },
  cellStrong: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
});