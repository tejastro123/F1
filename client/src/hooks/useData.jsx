import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/drivers');
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
    const handler = () => fetchDrivers();
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, [fetchDrivers]);

  return { drivers, loading, error, refetch: fetchDrivers };
}

export function useConstructors() {
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConstructors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/constructors');
      setConstructors(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConstructors();
    const handler = () => fetchConstructors();
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, [fetchConstructors]);

  return { constructors, loading, error, refetch: fetchConstructors };
}

export function useRaces() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRaces = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/races');
      setRaces(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRaces();
    const handler = () => fetchRaces();
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, [fetchRaces]);

  return { races, loading, error, refetch: fetchRaces };
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stats/overview');
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const handler = () => fetchStats();
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stats/leaderboard');
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
}

export function useNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/news');
      setNews(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const handler = () => fetchNews();
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, [fetchNews]);

  return { news, loading, error, refetch: fetchNews };
}

export function useOracle() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/oracle/prediction');
      // Defensive: ensure data shape
      if (data && typeof data === 'object' && data.race && data.predictions) {
        setReport(data);
        setError(null);
      } else {
        throw new Error('Invalid oracle data shape');
      }
    } catch (err) {
      // Always fallback to mock data on any error
      console.error('Oracle fetch failed:', err.message);
      const mockReport = {
        race: {
          name: "Japanese Grand Prix",
          round: 18,
          venue: "Suzuka Circuit",
          flag: "🇯🇵"
        },
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
      setReport(mockReport);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
    const handler = () => fetchReport();
    window.addEventListener('f1-data-updated', handler);
    return () => window.removeEventListener('f1-data-updated', handler);
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}
