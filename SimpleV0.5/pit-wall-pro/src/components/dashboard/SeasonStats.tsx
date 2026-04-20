"use client";

import { motion } from "framer-motion";
import type { DriverStanding, ConstructorStanding, Race } from "@/types/f1";

interface Props {
  drivers: DriverStanding[];
  teams: ConstructorStanding[];
  races: Race[];
}

export function SeasonStats({ drivers, teams, races }: Props) {
  if (drivers.length === 0) return null;

  const leader = drivers[0];
  const teamLeader = teams[0];
  const completedRaces = races.filter(r => new Date(r.date) < new Date()).length;
  const totalWins = drivers.reduce((sum, d) => sum + parseInt(d.wins), 0);

  const stats = [
    { label: "WDC LEADER", value: leader.Driver.code, sub: `${leader.points} PTS · ${leader.wins} WINS` },
    { label: "WCC LEADER", value: teamLeader?.Constructor.name.split(" ").pop()?.toUpperCase() || "---", sub: `${teamLeader?.points || 0} PTS TOTAL` },
    { label: "RACES DONE", value: completedRaces.toString(), sub: `OF ${races.length} TOTAL` },
    { label: "POINTS SCORED", value: totalWins.toString(), sub: "COMBINED WINS" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="font-orbitron font-bold text-lg text-white tracking-widest uppercase shrink-0">
          SEASON STATS
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
        <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">2026 · LIVE</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5 bg-[var(--f1-red)] border-2 border-[var(--f1-red)]">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="relative bg-[var(--f1-black)] px-6 py-7 overflow-hidden hover:scale-[1.03] transition-transform cursor-default group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(225,6,0,0.08)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--f1-gray-light)] uppercase mb-3">
              {s.label}
            </div>
            <div className="font-orbitron font-black text-[var(--f1-red)] leading-none mb-2"
              style={{ fontSize: "clamp(24px,3.5vw,42px)" }}>
              {s.value}
            </div>
            <div className="font-rajdhani font-medium text-sm text-white">{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
