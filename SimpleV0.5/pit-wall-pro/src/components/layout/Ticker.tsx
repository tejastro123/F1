"use client";

import { useMemo } from "react";
import { useF1Store } from "@/store/f1Store";
import { formatDate } from "@/lib/utils";

interface TickItem {
  sym: string;
  val: string;
  pts: string;
}

const DEFAULT_ITEMS: TickItem[] = [
  { sym: "SEASON", val: "2026", pts: "LIVE" },
  { sym: "WDC", val: "LOADING...", pts: "--- PTS" },
  { sym: "WCC", val: "LOADING...", pts: "--- PTS" },
  { sym: "NEXT", val: "LOADING...", pts: "---" },
  { sym: "STATUS", val: "LIVE", pts: "FEED ACTIVE" },
  { sym: "API", val: "ERGAST", pts: "CONNECTED" },
  { sym: "TRACK", val: "BAHRAIN", pts: "35°C" },
  { sym: "WEATHER", val: "CLEAR", pts: "SUNNY" },
];

export function Ticker() {
  const { driverStandings, constructorStandings, nextRace } = useF1Store();

  const items = useMemo(() => {
    if (driverStandings.length === 0) return DEFAULT_ITEMS;

    const leader = driverStandings[0];
    const teamLeader = constructorStandings[0];

    return [
      { sym: "2026 WDC", val: leader.Driver.code, pts: `${leader.points} PTS` },
      { sym: "WCC", val: teamLeader?.Constructor.name.split(" ").pop()?.toUpperCase() || "---", pts: `${teamLeader?.points || "---"} PTS` },
      { sym: "P1", val: leader.Driver.familyName.toUpperCase(), pts: leader.points + " PTS" },
      { sym: "NEXT RACE", val: nextRace ? nextRace.raceName.split(" ")[0].toUpperCase() : "TBA", pts: nextRace ? formatDate(nextRace.date) : "---" },
      ...driverStandings.slice(0, 5).map((d) => ({
        sym: `P${d.position}`,
        val: d.Driver.code,
        pts: `${d.points} PTS`,
      })),
      { sym: "STATUS", val: "LIVE", pts: "AUTO-UPDATE" },
      { sym: "API", val: "ERGAST", pts: "ACTIVE" },
    ];
  }, [driverStandings, constructorStandings, nextRace]);

  return (
    <div
      className="ticker-wrap relative h-[44px] flex items-center z-50"
      style={{ background: "var(--f1-black)", borderBottom: "2px solid var(--f1-red)" }}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, var(--f1-black), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, var(--f1-black), transparent)" }} />

      {/* LIVE badge */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-[var(--f1-red)] px-3 py-1"
        style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}>
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <span className="font-orbitron font-bold text-[10px] text-white tracking-widest">LIVE</span>
      </div>

      <div className="ticker-track ml-28" style={{ animation: "ticker 80s linear infinite" }}>
        {items.map((item, i) => (
          <span key={`t1-${i}`} className="inline-flex items-center gap-2.5 px-8">
            <span className="font-mono text-[11px] font-bold tracking-[0.15em] text-[var(--f1-red)]">
              {item.sym}
            </span>
            <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-white">
              {item.val}
            </span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--f1-gray-light)]">
              {item.pts}
            </span>
            <span className="text-[var(--f1-gray)] mx-2">●</span>
          </span>
        ))}
        {items.map((item, i) => (
          <span key={`t2-${i}`} className="inline-flex items-center gap-2.5 px-8">
            <span className="font-mono text-[11px] font-bold tracking-[0.15em] text-[var(--f1-red)]">
              {item.sym}
            </span>
            <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-white">
              {item.val}
            </span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--f1-gray-light)]">
              {item.pts}
            </span>
            <span className="text-[var(--f1-gray)] mx-2">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
