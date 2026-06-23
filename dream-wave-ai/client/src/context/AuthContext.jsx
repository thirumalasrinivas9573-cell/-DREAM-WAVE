import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, updateLoginStreak } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(res => {
        setUser(res.data.user);
        // Update daily login streak silently
        updateLoginStreak().then(r => {
          if (r.data.loginStreak !== undefined) {
            setUser(u => u ? { ...u, loginStreak: r.data.loginStreak, points: r.data.points ?? u.points } : u);
          }
        }).catch(() => {});
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveAuth = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    // Streak on fresh login
    updateLoginStreak().catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
