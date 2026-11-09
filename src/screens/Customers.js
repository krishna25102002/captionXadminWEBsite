import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import C, { inr, fmtDateTime } from '../theme.js';
import { useAuth } from '../context/AuthContext.js';
import { useNav } from '../context/NavContext.js';
import { getAdminCustomers, updateCustomer, deleteCustomer } from '../api.js';
import { SearchInput, Card, Badge, Avatar, Loader, EmptyState, RowActions, ConfirmDialog, EditModal } from '../components/UI.js';

const EDIT_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
];

const Customers = () => {
  const { token } = useAuth();
  const { navigate } = useNav();
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
      const res = await getAdminCustomers({ search: search.trim() }, token);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load customers');
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openEdit = (c) => {
    setEditValues({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
    });
    setEditing(c);
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await updateCustomer(editing._id, editValues, token);
      setEditing(null);
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
      await deleteCustomer(deleting._id, token);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err.message || 'Could not delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.toolbar}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search name, phone or email…" />
      </View>

      {!data && loading ? (
        <Loader label="Loading customers…" />
      ) : error ? (
        <Card>
          <Text style={{ color: C.danger }}>{error}</Text>
        </Card>
      ) : !data?.customers?.length ? (
        <Card>
          <EmptyState title="No customers found" message="Try a different search." />
        </Card>
      ) : (
        <View style={styles.table}>
          <View style={[styles.th, styles.rowLine]}>
            <Text style={[styles.thText, { flex: 2 }]}>Customer</Text>
            <Text style={[styles.thText, { flex: 1.4 }]}>Phone</Text>
            <Text style={[styles.thText, { flex: 1.6 }]}>Email</Text>
            <Text style={[styles.thText, { flex: 0.6, textAlign: 'center' }]}>Bookings</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Total Spent</Text>
            <Text style={[styles.thText, { flex: 1.1 }]}>Joined</Text>
            <Text style={[styles.thText, { flex: 0.9, textAlign: 'center' }]}>Actions</Text>
          </View>
          {data.customers.map((c) => (
            <View key={c._id} style={[styles.rowLine, { alignItems: 'center' }]}>
              <Pressable
                onPress={() => navigate('customer-detail', { id: c._id })}
                style={({ hovered }) => [styles.rowMain, hovered && { backgroundColor: C.surfaceAlt }]}
              >
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar name={c.name} size={32} />
                  <Text style={styles.cellStrong}>{c.name || '—'}</Text>
                </View>
                <Text style={[styles.cell, { flex: 1.4 }]}>{c.phone || '—'}</Text>
                <Text style={[styles.cell, { flex: 1.6 }]} numberOfLines={1}>{c.email || '—'}</Text>
                <View style={{ flex: 0.6, alignItems: 'center' }}>
                  <Badge label={String(c.bookings ?? 0)} color={c.bookings ? C.info : C.textMuted} />
                </View>
                <Text style={[styles.cell, { flex: 1, textAlign: 'right', color: C.text, fontWeight: '700' }]}>
                  {inr(c.spent)}
                </Text>
                <Text style={[styles.cell, { flex: 1.1 }]}>{fmtDateTime(c.createdAt).split(' ')[0]}</Text>
              </Pressable>
              <View style={{ flex: 0.9, alignItems: 'center' }}>
                <RowActions onEdit={() => openEdit(c)} onDelete={() => setDeleting(c)} />
              </View>
            </View>
          ))}
        </View>
      )}
      {data ? (
        <Text style={styles.meta}>
          Showing {data.count} of {data.total} customers
        </Text>
      ) : null}

      <EditModal
        visible={!!editing}
        title="Edit Customer"
        fields={EDIT_FIELDS}
        values={editValues}
        onChangeText={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
        onSave={doSave}
        onCancel={() => setEditing(null)}
        saving={saving}
      />
      <ConfirmDialog
        visible={!!deleting}
        title="Delete Customer"
        message={`Delete ${deleting?.name || 'this customer'} permanently? This removes their account from the database.`}
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
        loading={deleteLoading}
      />
    </View>
  );
};

export default Customers;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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