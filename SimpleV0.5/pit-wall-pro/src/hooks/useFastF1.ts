"use client";

import { useState, useCallback } from 'react';

const FASTF1_BASE_URL = 'http://localhost:8000';

export function useFastF1() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSession = useCallback(async (year: number, event: string, sessionType: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${FASTF1_BASE_URL}/session?year=${year}&event=${event}&session_type=${sessionType}`);
      if (!response.ok) throw new Error('Failed to load FastF1 session data');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTelemetry = useCallback(async (year: number, event: string, sessionType: string, driver: string, lapNumber?: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${FASTF1_BASE_URL}/telemetry?year=${year}&event=${event}&session_type=${sessionType}&driver=${driver}`;
      if (lapNumber) url += `&lap_number=${lapNumber}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load FastF1 telemetry');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComparison = useCallback(async (year: number, event: string, sessionType: string, d1: string, d2: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${FASTF1_BASE_URL}/comparison?year=${year}&event=${event}&session_type=${sessionType}&d1=${d1}&d2=${d2}`);
      if (!response.ok) throw new Error('Failed to load driver comparison');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getSession,
    getTelemetry,
    getComparison,
    loading,
    error
  };
}
