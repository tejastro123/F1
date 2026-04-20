import axios from "axios";
import type {
  DriverStanding,
  ConstructorStanding,
  Race,
  RaceResult,
  LapTime,
  PitStop,
} from "@/types/f1";

const ERGAST_BASE = "/api/f1";
const SEASON = "2026"; // Current season

// Cache in-memory for session
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function ergastFetch<T>(endpoint: string): Promise<T | null> {
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  try {
    const { data } = await axios.get(`${ERGAST_BASE}/${endpoint}.json?limit=100`, {
      timeout: 20000,
      headers: { Accept: "application/json" },
    });
    cache.set(cacheKey, { data: data.MRData, timestamp: Date.now() });
    return data.MRData as T;
  } catch (err) {

    return null;
  }
}

// Driver Standings
export async function fetchDriverStandings(
  season = SEASON
): Promise<DriverStanding[]> {
  const data = await ergastFetch<{
    StandingsTable: { StandingsLists: Array<{ DriverStandings: DriverStanding[]; round: string }> };
  }>(`${season}/driverstandings`);

  if (!data?.StandingsTable?.StandingsLists?.[0]) return [];
  return data.StandingsTable.StandingsLists[0].DriverStandings;
}

// Constructor Standings
export async function fetchConstructorStandings(
  season = SEASON
): Promise<ConstructorStanding[]> {
  const data = await ergastFetch<{
    StandingsTable: { StandingsLists: Array<{ ConstructorStandings: ConstructorStanding[] }> };
  }>(`${season}/constructorstandings`);

  if (!data?.StandingsTable?.StandingsLists?.[0]) return [];
  return data.StandingsTable.StandingsLists[0].ConstructorStandings;
}

// Race Schedule
export async function fetchRaceSchedule(season = SEASON): Promise<Race[]> {
  const data = await ergastFetch<{
    RaceTable: { Races: Race[] };
  }>(`${season}/races`);

  return data?.RaceTable?.Races || [];
}

// Season Drivers
export async function fetchSeasonDrivers(season = SEASON) {
  return await ergastFetch(`${season}/drivers`);
}

// Season Constructors
export async function fetchSeasonConstructors(season = SEASON) {
  return await ergastFetch(`${season}/constructors`);
}

// Season Results
export async function fetchSeasonResults(season = SEASON) {
  return await ergastFetch(`${season}/results`);
}

// Race Results
export async function fetchRaceResults(
  season = SEASON,
  round: string
): Promise<{ race: Race; results: RaceResult[] } | null> {
  const data = await ergastFetch<{
    RaceTable: { Races: Array<Race & { Results: RaceResult[] }> };
  }>(`${season}/${round}/results`);

  const race = data?.RaceTable?.Races?.[0];
  if (!race) return null;
  return { race, results: race.Results || [] };
}

// Qualifying Results
export async function fetchQualifyingResults(
  season = SEASON,
  round: string
): Promise<{ race: Race; results: unknown[] } | null> {
  const data = await ergastFetch<{
    RaceTable: { Races: Array<Race & { QualifyingResults: unknown[] }> };
  }>(`${season}/${round}/qualifying`);

  const race = data?.RaceTable?.Races?.[0];
  if (!race) return null;
  return { race, results: race.QualifyingResults || [] };
}

// Lap Times
export async function fetchLapTimes(
  season = SEASON,
  round: string,
  lap?: string
): Promise<LapTime[]> {
  const lapPath = lap ? `/laps/${lap}` : `/laps`;
  const data = await ergastFetch<{
    RaceTable: { Races: Array<{ Laps: LapTime[] }> };
  }>(`${season}/${round}${lapPath}`);

  return data?.RaceTable?.Races?.[0]?.Laps || [];
}

// Pit Stops
export async function fetchPitStops(
  season = SEASON,
  round: string
): Promise<PitStop[]> {
  const data = await ergastFetch<{
    RaceTable: { Races: Array<{ PitStops: PitStop[] }> };
  }>(`${season}/${round}/pitstops`);

  return data?.RaceTable?.Races?.[0]?.PitStops || [];
}

// Driver career stats
export async function fetchDriverStats(driverId: string): Promise<{
  wins: number;
  podiums: number;
  poles: number;
  championships: number;
} | null> {
  const [wins, poles] = await Promise.all([
    ergastFetch<{ total: string }>(`drivers/${driverId}/results/1`),
    ergastFetch<{ total: string }>(`drivers/${driverId}/qualifying/1`),
  ]);

  return {
    wins: parseInt((wins as { total: string })?.total || "0"),
    podiums: 0,
    poles: parseInt((poles as { total: string })?.total || "0"),
    championships: 0,
  };
}

// Multi-season comparison
export async function fetchSeasonComparison(
  seasons: string[]
): Promise<Record<string, DriverStanding[]>> {
  const results = await Promise.all(
    seasons.map(async (season) => {
      const standings = await fetchDriverStandings(season);
      return { season, standings };
    })
  );

  return results.reduce(
    (acc, { season, standings }) => {
      acc[season] = standings;
      return acc;
    },
    {} as Record<string, DriverStanding[]>
  );
}

// Additional Ergast Endpoints
export async function fetchSeasons() {
  return await ergastFetch("seasons");
}

export async function fetchCircuits() {
  return await ergastFetch("circuits");
}

export async function fetchSprintResults(season = SEASON, round: string) {
  return await ergastFetch(`${season}/${round}/sprint`);
}

export async function fetchStatus() {
  return await ergastFetch("status");
}

export { SEASON };
