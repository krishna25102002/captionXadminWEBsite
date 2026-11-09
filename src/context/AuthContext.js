import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminLogin, getAdminProfile } from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_user';

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const restore = async () => {
    try {
      const t = await AsyncStorage.getItem(TOKEN_KEY);
      const u = await AsyncStorage.getItem(ADMIN_KEY);
      if (t && u) {
        setToken(t);
        setAdmin(JSON.parse(u));
      }
    } catch (e) {
      console.log('AUTH RESTORE ERR:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await adminLogin(email, password);
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
    setToken(res.token);
    setAdmin(res.admin);
    return res;
  }, []);

  const refreshProfile = useCallback(async () => {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    if (!t) return;
    const res = await getAdminProfile(t);
    await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
    setAdmin(res.admin);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);