import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api.js';

const DataCacheContext = createContext(null);

export const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    drivers: { data: [], loading: false, error: null, lastFetched: 0 },
    constructors: { data: [], loading: false, error: null, lastFetched: 0 },
    races: { data: [], loading: false, error: null, lastFetched: 0 },
    stats: { data: null, loading: false, error: null, lastFetched: 0 },
    leaderboard: { data: [], loading: false, error: null, lastFetched: 0 },
    news: { data: [], loading: false, error: null, lastFetched: 0 },
    oracle: { data: null, loading: false, error: null, lastFetched: 0 },
  });

  const fetchData = useCallback(async (key, endpoint) => {
    // Prevent redundant fetches within 30 seconds
    if (Date.now() - cache[key].lastFetched < 30000 && cache[key].data?.length > 0) return;
    if (cache[key].loading) return;

    setCache(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));
    try {
      const { data } = await api.get(endpoint);
      setCache(prev => ({
        ...prev,
        [key]: { data, loading: false, error: null, lastFetched: Date.now() }
      }));
    } catch (err) {
      console.error(`Failed to fetch ${key}:`, err.message);
      setCache(prev => ({ 
        ...prev, 
        [key]: { ...prev[key], loading: false, error: err.message } 
      }));
    }
  }, [cache]);

  // Listen for global data refresh events
  useEffect(() => {
    const handler = () => {
      // Invalidate all cache on data-updated signal
      setCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(k => {
          newCache[k].lastFetched = 0;
        });
        return newCache;
      });
    };
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, []);

  return (
    <DataCacheContext.Provider value={{ cache, fetchData }}>
      {children}
    </DataCacheContext.Provider>
  );
};

export const useDataCache = () => {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error('useDataCache must be used within DataCacheProvider');
  return ctx;
};
