"use client";

import { motion } from "framer-motion";
import type { DriverStanding } from "@/types/f1";
import { getTeamColor, getPositionColor } from "@/lib/utils";
import { Star } from "lucide-react";

interface Props {
  standings: DriverStanding[];
  favoriteDriver: string;
  isLoading: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--f1-gray)]">
      <div className="skeleton w-8 h-6 rounded" />
      <div className="flex-1 space-y-2">
        <div className="skeleton w-36 h-4 rounded" />
        <div className="skeleton w-24 h-3 rounded" />
      </div>
      <div className="skeleton w-16 h-6 rounded" />
    </div>
  );
}

export function DriverStandingsCard({ standings, favoriteDriver, isLoading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-base overflow-hidden"
      style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))" }}
    >
      <div className="px-6 py-5 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
        <div className="font-orbitron font-bold text-lg text-white tracking-widest">DRIVERS&apos; CHAMPIONSHIP</div>
        <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mt-1">2026 · TOP 10 STANDINGS</div>
      </div>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
      ) : standings.length === 0 ? (
        <div className="p-12 text-center">
          <div className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest">LOADING DATA...</div>
        </div>
      ) : (
        standings.slice(0, 10).map((d, i) => {
          const teamColor = getTeamColor(d.Constructors[0]?.constructorId);
          const pos = parseInt(d.position);
          const isFav = d.Driver.driverId === favoriteDriver;
          const gap = pos > 1 ? `−${parseInt(standings[0].points) - parseInt(d.points)}` : "LEADER";

          return (
            <motion.div
              key={d.Driver.driverId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="relative flex items-center gap-4 px-6 py-4 border-b border-[var(--f1-gray)] hover:bg-[rgba(225,6,0,0.04)] transition-all group cursor-pointer"
              style={isFav ? { background: "rgba(6,0,239,0.08)" } : undefined}
            >
              {/* Team color bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: teamColor }} />

              {/* Position */}
              <div className="font-orbitron font-black text-xl w-8 text-center shrink-0"
                style={{ color: getPositionColor(pos) }}>
                {pos < 10 ? `0${pos}` : pos}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-rajdhani font-bold text-base text-white tracking-wide uppercase">
                    {d.Driver.givenName} {d.Driver.familyName}
                  </span>
                  <span className="font-orbitron font-bold text-[9px] text-white px-2 py-0.5"
                    style={{ background: teamColor, clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}>
                    {d.Driver.code}
                  </span>
                  {isFav && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                </div>
                <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-wider">
                  {d.Constructors[0]?.name} · {d.wins} WINS
                  <span className="ml-3 text-[var(--f1-red)]">{gap}</span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <div className="font-orbitron font-black text-2xl text-white tabular-nums">{d.points}</div>
                <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-wider">PTS</div>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
