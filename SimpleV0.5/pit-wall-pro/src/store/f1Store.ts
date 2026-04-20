import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type {
  DriverStanding,
  ConstructorStanding,
  Race,
  RaceResult,
  LiveRaceState,
  Notification,
  UserProfile,
  FantasyTeam,
  StrategyScenario,
} from "@/types/f1";

// ─── F1 Data Store ─────────────────────────────────────────────────────────
interface F1DataState {
  // Championships
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  
  // Calendar
  races: Race[];
  nextRace: Race | null;
  lastRace: Race | null;
  
  // Results
  lastRaceResults: RaceResult[];
  
  // Metadata
  currentSeason: string;
  dataUpdatedAt: Date | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDriverStandings: (standings: DriverStanding[]) => void;
  setConstructorStandings: (standings: ConstructorStanding[]) => void;
  setRaces: (races: Race[]) => void;
  setLastRaceResults: (results: RaceResult[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  computeRaceState: () => void;
}

export const useF1Store = create<F1DataState>()(
  devtools(
    (set, get) => ({
      driverStandings: [],
      constructorStandings: [],
      races: [],
      nextRace: null,
      lastRace: null,
      lastRaceResults: [],
      currentSeason: "2026",
      dataUpdatedAt: null,
      isLoading: false,
      error: null,

      setDriverStandings: (standings) =>
        set({ driverStandings: standings, dataUpdatedAt: new Date() }),

      setConstructorStandings: (standings) =>
        set({ constructorStandings: standings }),

      setRaces: (races) => {
        set({ races });
        get().computeRaceState();
      },

      setLastRaceResults: (results) => set({ lastRaceResults: results }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      computeRaceState: () => {
        const { races } = get();
        const now = new Date();

        const nextRace = races.find((r) => new Date(r.date) > now) || null;
        const pastRaces = races.filter((r) => new Date(r.date) < now);
        const lastRace = pastRaces[pastRaces.length - 1] || null;

        set({ nextRace, lastRace });
      },
    }),
    { name: "f1-data-store" }
  )
);

// ─── Live Race Store ────────────────────────────────────────────────────────
interface LiveRaceStoreState {
  liveRace: LiveRaceState | null;
  isConnected: boolean;
  lastUpdate: Date | null;
  
  setLiveRace: (state: LiveRaceState) => void;
  updateDriverPosition: (driverNumber: string, updates: Partial<LiveRaceState["drivers"][0]>) => void;
  setConnected: (connected: boolean) => void;
  clearLiveRace: () => void;
}

export const useLiveRaceStore = create<LiveRaceStoreState>()(
  devtools(
    (set, get) => ({
      liveRace: null,
      isConnected: false,
      lastUpdate: null,

      setLiveRace: (liveRace) =>
        set({ liveRace, lastUpdate: new Date() }),

      updateDriverPosition: (driverNumber, updates) => {
        const { liveRace } = get();
        if (!liveRace) return;
        
        set({
          liveRace: {
            ...liveRace,
            drivers: liveRace.drivers.map((d) =>
              d.driverNumber === driverNumber ? { ...d, ...updates } : d
            ),
          },
          lastUpdate: new Date(),
        });
      },

      setConnected: (isConnected) => set({ isConnected }),

      clearLiveRace: () => set({ liveRace: null, isConnected: false }),
    }),
    { name: "live-race-store" }
  )
);

// ─── User / Preferences Store ───────────────────────────────────────────────
interface UserState {
  profile: UserProfile;
  notifications: Notification[];
  unreadCount: number;
  
  isAuthenticated: boolean;
  
  setFavoriteDriver: (driverId: string) => void;
  setFavoriteTeam: (teamId: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  login: (username: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    devtools(
      (set, get) => ({
        profile: {
          id: "tejas",
          username: "Tejas",
          favoriteDriver: "verstappen",
          favoriteTeam: "red_bull",
          theme: "dark",
          notifications: true,
        },
        notifications: [],
        unreadCount: 0,
        isAuthenticated: false,

        login: (username) =>
          set((s) => ({
            isAuthenticated: true,
            profile: { ...s.profile, username },
          })),

        logout: () =>
          set((s) => ({
            isAuthenticated: false,
            profile: { ...s.profile, username: "Guest" },
          })),

        setFavoriteDriver: (driverId) =>
          set((s) => ({ profile: { ...s.profile, favoriteDriver: driverId } })),

        setFavoriteTeam: (teamId) =>
          set((s) => ({ profile: { ...s.profile, favoriteTeam: teamId } })),

        addNotification: (notification) => {
          const newNotif: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            read: false,
          };
          set((s) => ({
            notifications: [newNotif, ...s.notifications].slice(0, 50),
            unreadCount: s.unreadCount + 1,
          }));
        },

        markNotificationRead: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, s.unreadCount - 1),
          })),

        markAllRead: () =>
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          })),

        clearNotifications: () =>
          set({ notifications: [], unreadCount: 0 }),
      }),
      { name: "user-store" }
    ),
    {
      name: "pit-wall-user",
      partialize: (state) => ({ profile: state.profile, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Fantasy Store ──────────────────────────────────────────────────────────
interface FantasyState {
  myTeam: FantasyTeam | null;
  leaderboard: FantasyTeam[];
  
  setMyTeam: (team: FantasyTeam) => void;
  setLeaderboard: (teams: FantasyTeam[]) => void;
}

export const useFantasyStore = create<FantasyState>()(
  persist(
    (set) => ({
      myTeam: null,
      leaderboard: [],
      setMyTeam: (myTeam) => set({ myTeam }),
      setLeaderboard: (leaderboard) => set({ leaderboard }),
    }),
    { name: "pit-wall-fantasy" }
  )
);

// ─── Strategy Store ─────────────────────────────────────────────────────────
interface StrategyState {
  scenarios: StrategyScenario[];
  activeScenario: StrategyScenario | null;
  
  addScenario: (scenario: StrategyScenario) => void;
  setActiveScenario: (scenario: StrategyScenario | null) => void;
  removeScenario: (id: string) => void;
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set) => ({
      scenarios: [],
      activeScenario: null,
      addScenario: (scenario) =>
        set((s) => ({ scenarios: [...s.scenarios, scenario] })),
      setActiveScenario: (activeScenario) => set({ activeScenario }),
      removeScenario: (id) =>
        set((s) => ({ scenarios: s.scenarios.filter((sc) => sc.id !== id) })),
    }),
    { name: "pit-wall-strategy" }
  )
);
