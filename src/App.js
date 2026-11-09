import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import C from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavProvider, useNav } from './context/NavContext';
import Login from './screens/Login.jsx';
import Dashboard from './screens/Dashboard.js';
import Drivers from './screens/Drivers.js';
import DriverDetail from './screens/DriverDetail.js';
import Bookings from './screens/Bookings.js';
import BookingDetail from './screens/BookingDetail.js';
import Customers from './screens/Customers.js';
import CustomerDetail from './screens/CustomerDetail.js';
import Config from './screens/Config.js';
import Settings from './screens/Settings.jsx';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '◉' },
  { key: 'drivers', label: 'Drivers', icon: '☰' },
  { key: 'bookings', label: 'Bookings', icon: '▤' },
  { key: 'customers', label: 'Customers', icon: '☻' },
  { key: 'config', label: 'Config', icon: '⚙' },
  { key: 'settings', label: 'Settings', icon: '⚒' },
];

const TITLES = {
  dashboard: 'Dashboard',
  drivers: 'Drivers',
  'driver-detail': 'Driver Detail',
  bookings: 'Bookings',
  'booking-detail': 'Booking Detail',
  customers: 'Customers',
  'customer-detail': 'Customer Detail',
  config: 'Platform Config',
  settings: 'Settings',
};

function PageBody() {
  const { current } = useNav();
  switch (current.name) {
    case 'dashboard':
      return <Dashboard />;
    case 'drivers':
      return <Drivers />;
    case 'driver-detail':
      return <DriverDetail id={current.params.id} />;
    case 'bookings':
      return <Bookings />;
    case 'booking-detail':
      return <BookingDetail id={current.params.id} />;
    case 'customers':
      return <Customers />;
    case 'customer-detail':
      return <CustomerDetail id={current.params.id} />;
    case 'config':
      return <Config />;
    case 'settings':
      return <Settings />;
    default:
      return <Dashboard />;
  }
}

function Shell() {
  const { admin, logout } = useAuth();
  const { current, setRoot, back, stack } = useNav();
  const isDetail = current.name.endsWith('-detail');

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>D</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.brandName}>DriveGo</Text>
            <Text style={styles.brandSub}>Admin Panel</Text>
          </View>
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active =
              (current.name === item.key) ||
              (item.key === 'drivers' && current.name === 'driver-detail') ||
              (item.key === 'bookings' && current.name === 'booking-detail') ||
              (item.key === 'customers' && current.name === 'customer-detail');
            return (
              <Pressable
                key={item.key}
                onPress={() => setRoot(item.key)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <Text style={[styles.navIcon, active && { color: C.accent }]}>{item.icon}</Text>
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.adminRow}>
            <Text style={styles.adminName}>
              {admin ? admin.name || admin.email : 'Admin'}
            </Text>
            <Text numberOfLines={1} style={styles.adminEmail}>
              {admin ? admin.email : ''}
            </Text>
          </View>
          <Pressable onPress={logout} style={({ hovered }) => [styles.logoutBtn, hovered && { backgroundColor: C.dangerSoft }]}>
            <Text style={[styles.logoutText, { color: C.danger }]}>Log out</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topBar}>
          {isDetail ? (
            <Pressable onPress={back} style={({ hovered }) => [styles.backBtn, hovered && { backgroundColor: C.primarySoft }]}>
              <Text style={styles.backIcon}>‹</Text>
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
          ) : null}
          <Text style={styles.topBarTitle}>{TITLES[current.name] || 'DriveGo Admin'}</Text>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <PageBody />
        </ScrollView>
      </View>
    </View>
  );
}

function Root() {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <View style={styles.bootWrap}>
        <View style={styles.bootCard}>
          <Text style={styles.bootTitle}>DriveGo Admin</Text>
          <Text style={styles.bootSub}>Loading…</Text>
        </View>
      </View>
    );
  }
  if (!token || !token.length) return <Login />;
  return <Shell />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <Root />
      </NavProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.bg,
    minHeight: '100vh',
  },
  sidebar: {
    width: 220,
    backgroundColor: C.primaryDark,
    paddingVertical: 20,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandIconText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
  },
  brandName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  brandSub: {
    color: '#8A94AD',
    fontSize: 12,
  },
  nav: {
    flex: 1,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,106,0,0.12)',
  },
  navIcon: {
    color: '#8A94AD',
    fontSize: 15,
    width: 24,
  },
  navLabel: {
    color: '#B6BEDA',
    fontSize: 14,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#fff',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
  },
  adminRow: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  adminName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  adminEmail: {
    color: '#8A94AD',
    fontSize: 12,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    cursor: 'pointer',
  },
  logoutText: {
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topBar: {
    backgroundColor: C.surface,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    cursor: 'pointer',
  },
  backIcon: {
    color: C.accent,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 20,
  },
  backLabel: {
    color: C.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 28,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  bootWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primaryDark,
    minHeight: '100vh',
  },
  bootCard: {
    alignItems: 'center',
  },
  bootTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },
  bootSub: {
    color: '#8A94AD',
    fontSize: 14,
    marginTop: 6,
  },
});