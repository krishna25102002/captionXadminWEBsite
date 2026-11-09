import React, { createContext, useContext, useState, useCallback } from 'react';

const NavContext = createContext(null);

// Simple page-stack router (web-friendly, no native deps).
export const NavProvider = ({ children }) => {
  const [stack, setStack] = useState([{ name: 'dashboard', params: {} }]);

  const navigate = useCallback((name, params = {}) => {
    setStack((s) => [...s, { name, params }]);
  }, []);

  const replace = useCallback((name, params = {}) => {
    setStack([{ name, params }]);
  }, []);

  const setRoot = useCallback((name, params = {}) => {
    setStack([{ name, params }]);
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const current = stack[stack.length - 1];

  return (
    <NavContext.Provider value={{ stack, current, navigate, replace, back, setRoot }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);