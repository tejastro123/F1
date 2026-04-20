// ===== F1 Type Definitions =====

export interface Driver {
  driverId: string;
  code: string;
  number: string;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  url?: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  url?: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  url?: string;
  Circuit: Circuit;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { units: string; speed: string };
  };
}

export interface LapTime {
  number: string;
  Timings: Array<{ driverId: string; position: string; time: string }>;
}

export interface PitStop {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
}

// Live Race Data Types
export interface LiveDriver {
  position: number;
  driverNumber: string;
  driverCode: string;
  driverName: string;
  teamName: string;
  teamColor: string;
  gap: string;
  interval: string;
  lastLap: string;
  bestLap: string;
  sector1: string;
  sector2: string;
  sector3: string;
  tireCompound: TireCompound;
  tireAge: number;
  pitStops: number;
  drsActive: boolean;
  status: DriverStatus;
  speed?: number;
  throttle?: number;
  brake?: number;
}

export type TireCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";
export type DriverStatus = "ON_TRACK" | "PIT" | "OUT" | "SAFETY_CAR" | "VIRTUAL_SC";
export type RaceStatus = "NOT_STARTED" | "FORMATION_LAP" | "RACING" | "SAFETY_CAR" | "VIRTUAL_SAFETY_CAR" | "RED_FLAG" | "FINISHED";
export type SafetyCarStatus = "NONE" | "SAFETY_CAR" | "VIRTUAL_SAFETY_CAR" | "RED_FLAG";

export interface LiveRaceState {
  sessionName: string;
  trackName: string;
  currentLap: number;
  totalLaps: number;
  raceStatus: RaceStatus;
  safetyCarStatus: SafetyCarStatus;
  timeElapsed: string;
  timeRemaining: string;
  trackTemp: number;
  airTemp: number;
  humidity: number;
  windSpeed: number;
  drsEnabled: boolean;
  drivers: LiveDriver[];
}

// Telemetry Types
export interface TelemetryPoint {
  time: number;
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  gear: number;
  drs: boolean;
  x: number;
  y: number;
}

export interface LapTelemetry {
  driverId: string;
  driverCode: string;
  lap: number;
  lapTime: string;
  compound: TireCompound;
  telemetry: TelemetryPoint[];
}

// Analytics Types
export interface DriverAnalytics {
  driverId: string;
  driverCode: string;
  averageLapTime: number;
  consistency: number;
  overtakes: number;
  overtaken: number;
  topSpeed: number;
  avgThrottle: number;
  tireManagement: number;
  racePace: number;
  qualifyingPace: number;
}

// Strategy Types
export interface StrategyScenario {
  id: string;
  name: string;
  stints: Stint[];
  predictedFinish: number;
  pitStopCount: number;
  estimatedRaceTime: string;
}

export interface Stint {
  lap: number;
  tireCompound: TireCompound;
  laps: number;
}

// Fantasy Types
export interface FantasyTeam {
  id: string;
  userId: string;
  teamName: string;
  drivers: string[];
  constructor: string;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
  predictions?: Record<string, string>; 
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "critical";
}

export type NotificationType =
  | "RACE_START"
  | "OVERTAKE"
  | "PIT_STOP"
  | "SAFETY_CAR"
  | "RED_FLAG"
  | "FASTEST_LAP"
  | "CRASH"
  | "CHAMPIONSHIP_CHANGE"
  | "WEATHER";

// App State Types
export interface UserProfile {
  id: string;
  username: string;
  favoriteDriver: string;
  favoriteTeam: string;
  theme: "dark" | "light";
  notifications: boolean;
}

// Team Color Map
export const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27F4D2",
  ferrari: "#DC0000",
  mclaren: "#FF8700",
  red_bull: "#0600EF",
  williams: "#64C4FF",
  haas: "#B6BABD",
  alpine: "#0093CC",
  alphatauri: "#6692FF",
  alfa: "#900000",
  aston_martin: "#229971",
  kick_sauber: "#00E701",
  rb: "#6692FF",
};

export const TIRE_COLORS: Record<TireCompound, string> = {
  SOFT: "#FF1801",
  MEDIUM: "#FCD700",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#39B54A",
  WET: "#0067FF",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  Australia: "🇦🇺",
  Japan: "🇯🇵",
  China: "🇨🇳",
  Miami: "🇺🇸",
  Italy: "🇮🇹",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Canada: "🇨🇦",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  Hungary: "🇭🇺",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  "Las Vegas": "🇺🇸",
  Qatar: "🇶🇦",
  "Abu Dhabi": "🇦🇪",
};
