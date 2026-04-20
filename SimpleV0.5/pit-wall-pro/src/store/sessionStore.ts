import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  year: number;
  event: string;
  sessionType: string;
  setEvent: (event: string) => void;
  setSessionType: (type: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      year: 2026,
      event: 'Miami',
      sessionType: 'FP1',
      setEvent: (event) => set({ event }),
      setSessionType: (sessionType) => set({ sessionType }),
    }),
    {
      name: 'f1-session-storage',
    }
  )
);
