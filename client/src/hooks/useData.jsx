import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDataCache } from '../context/DataCacheContext.jsx';
import api from '../services/api.js';

export function useDrivers() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.drivers;

  useEffect(() => {
    fetchData('drivers', '/drivers');
  }, [fetchData]);

  return { drivers: data, loading, error, refetch: () => fetchData('drivers', '/drivers') };
}

export function useConstructors() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.constructors;

  useEffect(() => {
    fetchData('constructors', '/constructors');
  }, [fetchData]);

  return { constructors: data, loading, error, refetch: () => fetchData('constructors', '/constructors') };
}

export function useRaces() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.races;

  useEffect(() => {
    fetchData('races', '/races');
  }, [fetchData]);

  return { races: data, loading, error, refetch: () => fetchData('races', '/races') };
}

export function usePredictions(round) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchPredictions = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setPredictions([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const params = round ? `?round=${round}` : '';
      const { data } = await api.get(`/predictions${params}`);
      setPredictions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, [round, isAuthenticated, authLoading]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, error, refetch: fetchPredictions };
}

export function useStats() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.stats;

  useEffect(() => {
    fetchData('stats', '/stats/overview');
  }, [fetchData]);

  return { stats: data, loading, error, refetch: () => fetchData('stats', '/stats/overview') };
}

export function useLeaderboard() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.leaderboard;

  useEffect(() => {
    fetchData('leaderboard', '/stats/leaderboard');
  }, [fetchData]);

  return { leaderboard: data, loading, error, refetch: () => fetchData('leaderboard', '/stats/leaderboard') };
}

export function useNews() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.news;

  useEffect(() => {
    fetchData('news', '/news');
  }, [fetchData]);

  return { news: data, loading, error, refetch: () => fetchData('news', '/news') };
}

export function useOracle() {
  const { cache, fetchData } = useDataCache();
  const { data, loading, error } = cache.oracle;

  useEffect(() => {
    fetchData('oracle', '/oracle/prediction');
  }, [fetchData]);

  // Fallback Logic (Mock data if real fetch fails or is empty)
  const report = data || {
    race: { name: "Japanese Grand Prix", round: 18, venue: "Suzuka Circuit", flag: "🇯🇵" },
    predictions: [
      { _id: "ant1", fullName: "Kimi Antonelli", team: "Mercedes", probability: 27, photoUrl: "" },
      { _id: "rus63", fullName: "George Russell", team: "Mercedes", probability: 23, photoUrl: "" },
      { _id: "nor4", fullName: "Lando Norris", team: "McLaren", probability: 19, photoUrl: "" }
    ],
    rationale: [
      "Antonelli's recent dominance shows superior momentum vectors.",
      "Mercedes power unit optimization favors Russell in high-speed corners.",
      "McLaren's aero package gives Norris edge in Suzuka's technical sectors."
    ],
    oracleConfidence: 89
  };

  return { report, loading, error, refetch: () => fetchData('oracle', '/oracle/prediction') };
}
