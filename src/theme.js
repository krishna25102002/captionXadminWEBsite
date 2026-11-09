// =============================================
// DriveGo Admin Web Theme — Navy + Orange
// (same palette as the DriveGo mobile apps)
// =============================================

export const C = {
  primary: '#1B2A4A',
  primaryDark: '#131E38',
  primarySoft: '#E9EDF5',
  primaryBorder: '#C8D2E4',

  accent: '#FF6A00',
  accentDark: '#E85D00',
  accentSoft: '#FFF0E3',
  accentBorder: '#FFD9BC',

  bg: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAFB',
  border: '#EDEDEF',
  borderDark: '#E0E0E4',

  text: '#1A1A1A',
  textSub: '#6B6B6B',
  textMuted: '#9E9EA7',

  warning: '#FF9500',
  success: '#22B358',
  successSoft: '#E6F7EE',
  danger: '#EF4444',
  dangerSoft: '#FDEBEC',
  info: '#3B82F6',
  infoSoft: '#E8F1FE',
  pending: '#A855F7',
  pendingSoft: '#F3E8FF',

  white: '#FFFFFF',
  black: '#000000',
  inputBg: '#F2F2F4',
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

export const statusColor = (status) => {
  const s = String(status || '').toUpperCase();
  if (['COMPLETED', 'APPROVED', 'PAID', 'ONLINE', 'AVAILABLE'].includes(s)) return C.success;
  if (['CANCELLED', 'REJECTED', 'CANCELLED_DRIVER', 'NO_DRIVER_AVAILABLE'].includes(s)) return C.danger;
  if (s === 'PENDING') return C.pending;
  if (['CONFIRMED', 'ONGOING', 'ACTIVE'].includes(s)) return C.info;
  if (['OFFLINE', 'BUSY'].includes(s)) return C.warning;
  return C.textMuted;
};

export const inr = (n) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

export const num = (n) =>
  Math.round(Number(n) || 0).toLocaleString('en-IN');

export const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtDateTime = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return (
    dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
};

export default C;