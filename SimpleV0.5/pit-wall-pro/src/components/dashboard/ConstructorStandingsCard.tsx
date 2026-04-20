"use client";

import { motion } from "framer-motion";
import type { ConstructorStanding } from "@/types/f1";
import { getTeamColor, getPositionColor } from "@/lib/utils";
import { Star } from "lucide-react";

interface Props {
  standings: ConstructorStanding[];
  favoriteTeam: string;
  isLoading: boolean;
}

export function ConstructorStandingsCard({ standings, favoriteTeam, isLoading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-base overflow-hidden"
      style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))" }}
    >
      <div className="px-6 py-5 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
        <div className="font-orbitron font-bold text-lg text-white tracking-widest">CONSTRUCTORS&apos; CUP</div>
        <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mt-1">2026 · TEAM STANDINGS</div>
      </div>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--f1-gray)]">
            <div className="skeleton w-8 h-6 rounded" />
            <div className="flex-1 space-y-2">
              <div className="skeleton w-32 h-4 rounded" />
              <div className="skeleton w-20 h-3 rounded" />
            </div>
            <div className="skeleton w-16 h-8 rounded" />
          </div>
        ))
      ) : (
        standings.map((t, i) => {
          const teamColor = getTeamColor(t.Constructor.constructorId);
          const pos = parseInt(t.position);
          const isFav = t.Constructor.constructorId === favoriteTeam;
          const maxPts = parseInt(standings[0]?.points || "1");
          const pct = (parseInt(t.points) / maxPts) * 100;

          return (
            <motion.div
              key={t.Constructor.constructorId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              className="relative flex items-center gap-4 px-6 py-4 border-b border-[var(--f1-gray)] hover:bg-[rgba(225,6,0,0.04)] transition-all"
              style={isFav ? { background: `${teamColor}10` } : undefined}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: teamColor }} />

              <div className="font-orbitron font-black text-xl w-8 text-center shrink-0"
                style={{ color: getPositionColor(pos) }}>
                {pos < 10 ? `0${pos}` : pos}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-rajdhani font-bold text-base text-white tracking-wide uppercase">
                    {t.Constructor.name}
                  </span>
                  {isFav && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                </div>
                {/* Points bar */}
                <div className="relative h-1.5 bg-[var(--f1-gray)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ background: teamColor }}
                  />
                </div>
                <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-wider mt-1">
                  {t.wins} WINS · {t.Constructor.nationality.substring(0, 3).toUpperCase()}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-orbitron font-black text-2xl text-white tabular-nums">{t.points}</div>
                <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-wider">PTS</div>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
