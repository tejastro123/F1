"use client";

import { motion } from "framer-motion";
import type { Race, RaceResult } from "@/types/f1";
import { getTeamColor, getPositionColor, formatDate, getCountryFlag } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface Props { race: Race; results: RaceResult[]; isLoading: boolean; }

export function LastRaceResults({ race, results, isLoading }: Props) {
  if (isLoading || results.length === 0) return null;
  const flag = getCountryFlag(race.Circuit.Location.country);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-[var(--f1-red)]">
        <div className="flex items-center gap-3">
          <Trophy size={20} className="text-[var(--f1-red)]" />
          <h2 className="font-orbitron font-bold text-xl text-white tracking-widest uppercase">LAST RACE RESULT</h2>
        </div>
        <div className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest">
          {flag} {race.raceName.toUpperCase()} · {formatDate(race.date)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {results.slice(0, 3).map((r, i) => {
          const teamColor = getTeamColor(r.Constructor.constructorId);
          const pos = parseInt(r.position);
          const podiumLabels = ["🥇 WINNER", "🥈 SECOND", "🥉 THIRD"];

          return (
            <motion.div
              key={r.Driver.driverId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="relative p-6 border-2 bg-[var(--f1-dark)] text-center"
              style={{
                borderColor: teamColor,
                clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)"
              }}
            >
              <div className="font-mono text-[10px] tracking-widest text-[var(--f1-gray-light)] mb-3">
                {podiumLabels[i]}
              </div>
              <div className="font-orbitron font-black mb-2" style={{ fontSize: "clamp(36px,5vw,56px)", color: getPositionColor(pos) }}>
                P{pos}
              </div>
              <div className="font-rajdhani font-bold text-lg text-white uppercase tracking-wide">
                {r.Driver.givenName} {r.Driver.familyName}
              </div>
              <div className="font-mono text-[10px] tracking-wider text-[var(--f1-gray-light)] mt-1">
                {r.Constructor.name}
              </div>
              <div className="font-mono text-[12px] tracking-wider text-[var(--f1-red)] mt-2 font-bold">
                {pos === 1 ? r.Time?.time || "—" : `+${r.Time?.time || r.status}`}
              </div>
              <div className="mt-3 font-mono text-[11px] text-white font-bold">{r.points} PTS</div>
            </motion.div>
          );
        })}
      </div>

      {/* Full results mini-table */}
      <div className="card-base overflow-hidden"
        style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))" }}>
        <div className="px-5 py-3 bg-[rgba(225,6,0,0.05)] border-b border-[var(--f1-gray)]">
          <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">FULL CLASSIFICATION</span>
        </div>
        {results.map((r, i) => {
          const teamColor = getTeamColor(r.Constructor.constructorId);
          return (
            <div key={r.Driver.driverId}
              className="relative flex items-center gap-4 px-5 py-3 border-b border-[var(--f1-gray)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: teamColor }} />
              <div className="font-orbitron font-bold text-sm w-6 text-right shrink-0"
                style={{ color: getPositionColor(parseInt(r.position)) }}>
                {r.position}
              </div>
              <span className="font-mono text-[10px] text-white px-1.5 py-0.5 shrink-0"
                style={{ background: teamColor, clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)" }}>
                {r.Driver.code}
              </span>
              <div className="flex-1 font-rajdhani font-semibold text-sm text-white uppercase">
                {r.Driver.givenName} {r.Driver.familyName}
              </div>
              <div className="font-mono text-[11px] text-[var(--f1-gray-light)] hidden md:block">
                {r.Constructor.name}
              </div>
              <div className="font-mono text-[11px] text-[var(--f1-red)] font-bold shrink-0">
                {parseInt(r.position) === 1 ? r.Time?.time : `+${r.Time?.time || r.status}`}
              </div>
              <div className="font-orbitron font-bold text-sm text-white shrink-0 w-10 text-right">
                {r.points}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
