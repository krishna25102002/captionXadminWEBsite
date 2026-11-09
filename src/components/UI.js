import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import C, { shadow } from '../theme';

// =====================
// Buttons
// =====================
export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style }) => {
  const bg =
    variant === 'secondary'
      ? C.surface
      : variant === 'danger'
        ? C.danger
        : variant === 'success'
          ? C.success
          : C.accent;
  const border = variant === 'secondary' ? C.borderDark : 'transparent';
  const color =
    variant === 'secondary' ? C.primary : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'secondary' ? 1.5 : 0 }, disabled && { opacity: 0.55 }, style]}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={[styles.btnText, { color }]}>{title}</Text>}
    </Pressable>
  );
};

export const IconButton = ({ label, symbol, onPress, color }) => (
  <Pressable onPress={onPress} style={({ hovered }) => [styles.iconBtn, hovered && { backgroundColor: C.primarySoft }]}>
    <Text style={[styles.iconBtnText, { color: color || C.primary }]}>{symbol}</Text>
    <Text style={[styles.iconBtnLabel, { color: color || C.primary }]}>{label}</Text>
  </Pressable>
);

// =====================
// Inputs
// =====================
export const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline, required, error }) => (
  <View style={styles.field}>
    {label ? (
      <Text style={styles.fieldLabel}>
        {label} {required ? <Text style={{ color: C.danger }}>*</Text> : null}
      </Text>
    ) : null}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.textMuted}
      keyboardType={keyboardType}
      multiline={multiline}
      style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }, error && { borderColor: C.danger }]}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

export const SearchInput = ({ value, onChangeText, placeholder = 'Search…' }) => (
  <View style={styles.searchWrap}>
    <Text style={styles.searchIcon}>⌕</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.textMuted}
      style={styles.searchInput}
    />
  </View>
);

// =====================
// Data display
// =====================
export const Badge = ({ label, color }) => (
  <View style={[styles.badge, { backgroundColor: C.surface }]}>
    <View style={[styles.badgeDot, { backgroundColor: color }]} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const InfoRow = ({ label, value, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

export const StatCard = ({ label, value, sub, icon, tint }) => (
  <View style={[styles.statCard, { borderTopColor: tint || C.accent }]}>
    <View style={styles.statHeader}>
      <Text style={styles.statIcon}>{icon || '•'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </View>
);

export const Avatar = ({ name, size = 40 }) => {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
};

export const EmptyState = ({ title, message }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>🗂</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMsg}>{message || 'Nothing here yet.'}</Text>
  </View>
);

export const Loader = ({ label }) => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color={C.accent} />
    {label ? <Text style={styles.loaderText}>{label}</Text> : null}
  </View>
);

export const SectionTitle = ({ title, action }) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action}
  </View>
);

// =====================
// Row actions (edit / delete icon buttons)
// =====================
export const RowActions = ({ onEdit, onDelete, disabled }) => (
  <View style={styles.rowActions}>
    <Pressable
      onPress={onEdit}
      disabled={disabled}
      style={({ hovered }) => [styles.rowAction, hovered && { backgroundColor: C.infoSoft }]}
      title="Edit"
    >
      <Text style={[styles.rowActionSymbol, { color: C.info }]}>&#9998;</Text>
    </Pressable>
    <Pressable
      onPress={onDelete}
      disabled={disabled}
      style={({ hovered }) => [styles.rowAction, hovered && { backgroundColor: C.dangerSoft }]}
      title="Delete"
    >
      <Text style={[styles.rowActionSymbol, { color: C.danger }]}>&#128465;</Text>
    </Pressable>
  </View>
);

// =====================
// Overlay (web-friendly modal shell, no native Modal/fade)
// =====================
export const Overlay = ({ visible, onDismiss, children }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlayWrap}>
      <Pressable style={styles.overlayDismiss} onPress={onDismiss} />
      <View style={styles.overlayLayer}>{children}</View>
    </View>
  );
};

// =====================
// Confirm dialog (delete / destructive actions)
// =====================
export const ConfirmDialog = ({ visible, title = 'Confirm', message, confirmLabel = 'Delete', onCancel, onConfirm, loading }) => (
  <Overlay visible={visible} onDismiss={onCancel}>
    <View style={styles.dialog}>
      <View style={styles.dialogIconCircle}>
        <Text style={styles.dialogIcon}>&#9888;</Text>
      </View>
      <Text style={styles.dialogTitle}>{title}</Text>
      {message ? <Text style={styles.dialogMsg}>{message}</Text> : null}
      <View style={styles.dialogActions}>
        <Button title="Cancel" variant="secondary" onPress={onCancel} disabled={loading} style={{ flex: 1 }} />
        <Button
          title={confirmLabel}
          variant="danger"
          onPress={onConfirm}
          loading={loading}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  </Overlay>
);

// =====================
// Edit modal (generic field editor)
// =====================
export const EditModal = ({ visible, title = 'Edit', fields, values, onChangeText, onSave, onCancel, saving }) => (
  <Overlay visible={visible} onDismiss={onCancel}>
    <View style={[styles.dialog, styles.editDialog]}>
      <Text style={styles.dialogTitle}>{title}</Text>
      <ScrollView style={styles.editFields} contentContainerStyle={styles.editFieldsContent}>
        {fields.map((f) => (
          <View key={f.key}>
            {f.type === 'select' ? (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <View style={styles.selectWrap}>
                  {(f.options || []).map((opt) => {
                    const active = String(values[f.key] ?? '') === String(opt);
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => onChangeText(f.key, opt)}
                        style={[styles.selectChip, active && { backgroundColor: C.accent, borderColor: C.accent }]}
                      >
                        <Text style={[styles.selectChipText, active && { color: '#fff' }]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Field
                label={f.label}
                value={String(values[f.key] ?? '')}
                onChangeText={(v) => onChangeText(f.key, v)}
                placeholder={f.placeholder}
                keyboardType={f.keyboardType}
                multiline={f.multiline}
              />
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.dialogActions}>
        <Button title="Cancel" variant="secondary" onPress={onCancel} disabled={saving} style={{ flex: 1 }} />
        <Button title="Save" variant="success" onPress={onSave} loading={saving} style={{ flex: 1 }} />
      </View>
    </View>
  </Overlay>
);

// Filter chips row
export const FilterChips = ({ options, value, onChange }) => (
  <View style={styles.chipsWrap}>
    {options.map((opt) => {
      const active = (value || 'All') === opt;
      return (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.chip, active && { backgroundColor: C.primary, borderColor: C.primary }]}
        >
          <Text style={[styles.chipText, active && { color: '#fff' }]}>{opt}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...shadow,
    shadowOpacity: 0.12,
    cursor: 'pointer',
  },
  btnText: {
    fontWeight: '700',
    fontSize: 15,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  iconBtnText: {
    fontSize: 18,
    marginRight: 6,
    fontWeight: 'bold',
  },
  iconBtnLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: C.textSub,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.borderDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: C.text,
    fontSize: 15,
    outlineStyle: 'none',
  },
  errorText: {
    color: C.danger,
    fontSize: 12,
    marginTop: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    minWidth: 220,
  },
  searchIcon: {
    color: C.textMuted,
    fontSize: 18,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    color: C.text,
    fontSize: 14,
    outlineStyle: 'none',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: {
    color: C.textMuted,
    fontSize: 13,
    marginRight: 16,
  },
  infoValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  statCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
    minWidth: 180,
    flexGrow: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 15,
    color: C.textMuted,
    marginRight: 6,
  },
  statLabel: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
  },
  statSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  avatar: {
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyMsg: {
    color: C.textMuted,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    color: C.textMuted,
    marginTop: 10,
    fontSize: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.borderDark,
    backgroundColor: C.surface,
    cursor: 'pointer',
  },
  chipText: {
    color: C.textSub,
    fontWeight: '600',
    fontSize: 13,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 6,
  },
  rowAction: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    cursor: 'pointer',
  },
  rowActionSymbol: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 20,
  },
  overlayWrap: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13,20,40,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 1000,
  },
  overlayDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayLayer: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  dialog: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 24,
    width: 420,
    maxWidth: '100%',
    ...shadow,
    shadowOpacity: 0.18,
  },
  dialogIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dialogIcon: {
    color: C.danger,
    fontSize: 24,
    fontWeight: '900',
  },
  dialogTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  dialogMsg: {
    color: C.textSub,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  editDialog: {
    width: 480,
  },
  editFields: {
    maxHeight: 420,
    marginTop: 10,
  },
  editFieldsContent: {
    gap: 0,
    paddingBottom: 6,
  },
  selectWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.borderDark,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  selectChip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.borderDark,
    backgroundColor: C.surface,
    cursor: 'pointer',
  },
  selectChipText: {
    color: C.textSub,
    fontWeight: '600',
    fontSize: 13,
  },
});