import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refresh token on mount + set up proactive refresh interval
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        
        const meRes = await api.get('/auth/me');
        setUser(meRes.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session refresh failed:', err);
        clearAccessToken();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    tryRefresh();

    // Proactive refresh every 12 minutes (token expires in 15m)
    const interval = setInterval(async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        console.info('Access token proactively refreshed');
      } catch (err) {
        console.error('Proactive refresh failed:', err);
      }
    }, 12 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    
    const meRes = await api.get('/auth/me');
    setUser(meRes.data.user);
    
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    clearAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
