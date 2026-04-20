import { useState, useCallback } from 'react';

const FASTF1_BASE_URL = 'http://localhost:8000';

export interface DriverTelemetry {
  driver: string;
  lap_number: number;
  lap_time: string;
  telemetry: {
    time: number[];
    speed: number[];
    rpm: number[];
    gear: number[];
    throttle: number[];
    brake: number[];
    drs: number[];
    x: number[];
    y: number[];
    z: number[];
  };
}

export interface ComparisonData {
  d1: {
    name: string;
    lap_time: string;
    speed: number[];
    distance: number[];
    gear: number[];
  };
  d2: {
    name: string;
    lap_time: string;
    speed: number[];
    distance: number[];
    gear: number[];
  };
  delta: number[];
  ref_distance: number[];
}

export interface LapData {
  driver: string;
  lap_number: number;
  lap_time: number;
  compound: string;
  is_personal_best: boolean;
}

export interface TrackMapData {
  x: number[];
  y: number[];
  speed: number[];
  gear: number[];
  throttle: number[];
  brake: number[];
  distance: number[];
  corners: Array<{
    number: string;
    x: number;
    y: number;
    angle: number;
    distance: number;
  }>;
}

export interface SessionResult {
  position: number | null;
  driver_number: string;
  driver_code: string;
  team: string;
  status: string;
  points: number;
  full_name: string;
}

export interface SessionData {
  session_name: string;
  location: string;
  results: SessionResult[];
}

export interface StrategySimulationResult {
  total_time: number;
  total_time_formatted: string;
  stints: Array<{
    stint: number;
    compound: string;
    laps: number;
    avg_lap: number;
    stint_time: number;
  }>;
}

export function useFastF1() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
      }
    }
  };

  const getSession = useCallback(async (year: number, event: string, sessionType: string): Promise<SessionData | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/session?year=${year}&event=${event}&session_type=${sessionType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTelemetry = useCallback(async (year: number, event: string, sessionType: string, driver: string, lapNumber?: number): Promise<DriverTelemetry | null> => {
    setLoading(true);
    setError(null);
    try {
      let url = `${FASTF1_BASE_URL}/telemetry?year=${year}&event=${event}&session_type=${sessionType}&driver=${driver}`;
      if (lapNumber) url += `&lap_number=${lapNumber}`;
      return await fetchWithRetry(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComparison = useCallback(async (year: number, event: string, sessionType: string, d1: string, d2: string): Promise<ComparisonData | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/comparison?year=${year}&event=${event}&session_type=${sessionType}&d1=${d1}&d2=${d2}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLaps = useCallback(async (year: number, event: string, sessionType: string): Promise<LapData[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/laps?year=${year}&event=${event}&session_type=${sessionType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrackMap = useCallback(async (year: number, event: string, sessionType: string, driver?: string): Promise<TrackMapData | null> => {
    setLoading(true);
    setError(null);
    try {
      let url = `${FASTF1_BASE_URL}/track-map?year=${year}&event=${event}&session_type=${sessionType}`;
      if (driver) url += `&driver=${driver}`;
      return await fetchWithRetry(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActualStrategy = useCallback(async (year: number, event: string): Promise<any[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/strategy-actual?year=${year}&event=${event}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLapDistribution = useCallback(async (year: number, event: string): Promise<any[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/lap-distribution?year=${year}&event=${event}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeamPace = useCallback(async (year: number, event: string): Promise<any[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/team-pace?year=${year}&event=${event}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSeasonResults = useCallback(async (year: number): Promise<any[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/season-results?year=${year}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSeasonSummary = useCallback(async (year: number): Promise<any[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/season-summary?year=${year}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWdcScenarios = useCallback(async (year: number, currentRound: number): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/wdc-scenarios?year=${year}&current_round=${currentRound}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWccScenarios = useCallback(async (year: number, currentRound: number): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/wcc-scenarios?year=${year}&current_round=${currentRound}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStrategySimulation = useCallback(async (year: number, event: string, stints: any[]): Promise<StrategySimulationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const stintsJson = JSON.stringify(stints);
      return await fetchWithRetry(`${FASTF1_BASE_URL}/strategy-simulation?year=${year}&event=${event}&stints=${encodeURIComponent(stintsJson)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQualifying = useCallback(async (year: number, event: string): Promise<any[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchWithRetry(`${FASTF1_BASE_URL}/qualifying?year=${year}&event=${event}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getSession,
    getTelemetry,
    getComparison,
    getLaps,
    getTrackMap,
    getQualifying,
    getActualStrategy,
    getLapDistribution,
    getTeamPace,
    getSeasonResults,
    getSeasonSummary,
    getWdcScenarios,
    getWccScenarios,
    getStrategySimulation,
    loading,
    error
  };
}
