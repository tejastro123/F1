"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchRaceSchedule,
  fetchRaceResults,
} from "@/lib/api";
import { useF1Store } from "@/store/f1Store";

const STALE_TIME = 5 * 60 * 1000; // 5 min
const REFETCH_INTERVAL = 10 * 60 * 1000; // 10 min

export function useF1Data() {
  const {
    setDriverStandings,
    setConstructorStandings,
    setRaces,
    setLastRaceResults,
    setLoading,
    setError,
  } = useF1Store();

  const queryClient = useQueryClient();

  // Driver Standings
  const driversQuery = useQuery({
    queryKey: ["driverStandings"],
    queryFn: () => fetchDriverStandings(),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    retry: 3,
  });

  // Constructor Standings
  const constructorsQuery = useQuery({
    queryKey: ["constructorStandings"],
    queryFn: () => fetchConstructorStandings(),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    retry: 3,
  });

  // Race Schedule
  const racesQuery = useQuery({
    queryKey: ["raceSchedule"],
    queryFn: () => fetchRaceSchedule(),
    staleTime: STALE_TIME * 12, // 1 hour
    retry: 3,
  });

  // Sync to Zustand store
  useEffect(() => {
    if (driversQuery.data) setDriverStandings(driversQuery.data);
  }, [driversQuery.data, setDriverStandings]);

  useEffect(() => {
    if (constructorsQuery.data) setConstructorStandings(constructorsQuery.data);
  }, [constructorsQuery.data, setConstructorStandings]);

  useEffect(() => {
    if (racesQuery.data) setRaces(racesQuery.data);
  }, [racesQuery.data, setRaces]);

  // Loading state
  useEffect(() => {
    setLoading(driversQuery.isLoading || constructorsQuery.isLoading || racesQuery.isLoading);
  }, [driversQuery.isLoading, constructorsQuery.isLoading, racesQuery.isLoading, setLoading]);

  // Error state
  useEffect(() => {
    const err = driversQuery.error || constructorsQuery.error || racesQuery.error;
    setError(err ? "Failed to load F1 data. Retrying..." : null);
  }, [driversQuery.error, constructorsQuery.error, racesQuery.error, setError]);

  // Load last race results once we know the last race
  const { lastRace } = useF1Store();
  const lastRaceQuery = useQuery({
    queryKey: ["lastRaceResults", lastRace?.round],
    queryFn: () =>
      lastRace ? fetchRaceResults("2026", lastRace.round) : null,
    enabled: !!lastRace,
    staleTime: STALE_TIME * 24,
    retry: 2,
  });

  useEffect(() => {
    if (lastRaceQuery.data?.results) {
      setLastRaceResults(lastRaceQuery.data.results);
    }
  }, [lastRaceQuery.data, setLastRaceResults]);

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ["driverStandings"] });
    queryClient.invalidateQueries({ queryKey: ["constructorStandings"] });
    queryClient.invalidateQueries({ queryKey: ["raceSchedule"] });
  };

  return {
    isLoading: driversQuery.isLoading || constructorsQuery.isLoading || racesQuery.isLoading,
    isError: driversQuery.isError || constructorsQuery.isError || racesQuery.isError,
    refetchAll,
  };
}
