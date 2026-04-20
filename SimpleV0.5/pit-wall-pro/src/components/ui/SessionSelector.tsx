"use client";

import React, { useEffect, useState } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { fetchRaceSchedule } from "@/lib/api";
import { Race } from "@/types/f1";
import { ChevronDown, Calendar, MapPin, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function SessionSelector() {
  const { year, event, sessionType, setEvent, setSessionType } = useSessionStore();
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      setIsLoading(true);
      try {
        const schedule = await fetchRaceSchedule(year.toString());
        setRaces(schedule);
      } catch (error) {
        console.error("Failed to load schedule:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchedule();
  }, [year]);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg">
      {/* Season Tag */}
      <div className="px-4 py-2 bg-[var(--f1-red)] text-white font-orbitron font-black text-xs italic"
        style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}>
        2026 LIVE
      </div>

      {/* Event Selector */}
      <div className="relative group flex-1 min-w-[200px]">
        <label className="absolute -top-2 left-3 px-1 bg-black text-[9px] font-mono text-[var(--f1-red)] tracking-widest uppercase">Event</label>
        <div className="relative">
          <select
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full bg-black border border-white/10 text-white font-mono text-xs p-3 pr-8 outline-none appearance-none hover:border-[var(--f1-red)] transition-colors"
          >
            {isLoading ? (
              <option>Loading schedule...</option>
            ) : (
              races.map((r) => (
                <option key={r.round} value={r.raceName}>
                  R{r.round.padStart(2, '0')} — {r.raceName.replace(" Grand Prix", "")}
                </option>
              ))
            )}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* Session Selector */}
      <div className="relative group">
        <label className="absolute -top-2 left-3 px-1 bg-black text-[9px] font-mono text-[var(--f1-red)] tracking-widest uppercase">Session</label>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="bg-black border border-white/10 text-white font-mono text-xs p-3 pr-8 outline-none appearance-none hover:border-[var(--f1-red)] transition-colors min-w-[120px]"
        >
          <option value="R">RACE</option>
          <option value="Q">QUALIFYING</option>
          <option value="FP3">FP3</option>
          <option value="FP2">FP2</option>
          <option value="FP1">FP1</option>
          <option value="S">SPRINT</option>
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>

      <div className="flex items-center gap-4 ml-auto pl-4 border-l border-white/5">
        <div className="flex flex-col">
          <span className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase tracking-widest">Uplink Status</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[9px] text-white">FASTF1_ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
