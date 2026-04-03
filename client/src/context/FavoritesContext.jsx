import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState({
    drivers: [],
    constructors: [],
    races: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch favorites when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      // Clear favorites when logged out
      setFavorites({ drivers: [], constructors: [], races: [] });
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/favorites');
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = useCallback(async (type, id) => {
    try {
      await api.post(`/favorites/${type}/${id}`);
      setFavorites(prev => ({
        ...prev,
        [type]: [...prev[type], id],
      }));
      return { success: true };
    } catch (err) {
      console.error('Failed to add favorite:', err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const removeFavorite = useCallback(async (type, id) => {
    try {
      await api.delete(`/favorites/${type}/${id}`);
      setFavorites(prev => ({
        ...prev,
        [type]: prev[type].filter(favId => favId !== id),
      }));
      return { success: true };
    } catch (err) {
      console.error('Failed to remove favorite:', err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const toggleFavorite = useCallback(async (type, id, currentFavorites) => {
    const isFavorited = currentFavorites.includes(id);
    if (isFavorited) {
      return await removeFavorite(type, id);
    } else {
      return await addFavorite(type, id);
    }
  }, [addFavorite, removeFavorite]);

  const isFavorited = useCallback((type, id) => {
    return favorites[type]?.includes(id) || false;
  }, [favorites]);

  const favoriteCount = {
    drivers: favorites.drivers.length,
    constructors: favorites.constructors.length,
    races: favorites.races.length,
    total: favorites.drivers.length + favorites.constructors.length + favorites.races.length,
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      fetchFavorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorited,
      favoriteCount,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
