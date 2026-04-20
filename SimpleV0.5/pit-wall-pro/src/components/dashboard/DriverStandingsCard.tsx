"use client";

import { motion } from "framer-motion";
import type { DriverStanding } from "@/types/f1";
import { getTeamColor, getPositionColor } from "@/lib/utils";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  standings: DriverStanding[];
  favoriteDriver: string;
  isLoading: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
      <div className="skeleton w-8 h-8 rounded opacity-20" />
      <div className="flex-1 space-y-2">
        <div className="skeleton w-36 h-4 rounded opacity-20" />
        <div className="skeleton w-24 h-3 rounded opacity-10" />
      </div>
      <div className="skeleton w-16 h-8 rounded opacity-20" />
    </div>
  );
}

export function DriverStandingsCard({ standings, favoriteDriver, isLoading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="border border-white/10 bg-white/[0.01] backdrop-blur-md overflow-hidden relative"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}
    >
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="font-orbitron font-bold text-sm text-white tracking-[0.2em]">LEADERBOARD</div>
          <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-[0.3em] mt-1 uppercase font-bold">DRIVERS CHAMPIONSHIP</div>
        </div>
        <div className="px-3 py-1 border border-[var(--f1-red)] text-[var(--f1-red)] font-mono text-[9px] tracking-widest animate-pulse">LIVE FEED</div>
      </div>

      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
        ) : standings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">NO DATA AVAILABLE</div>
          </div>
        ) : (
          standings.slice(0, 15).map((d, i) => {
            const teamColor = getTeamColor(d.Constructors[0]?.constructorId);
            const pos = parseInt(d.position);
            const isFav = d.Driver.driverId === favoriteDriver;
            const gap = pos > 1 ? `-${parseInt(standings[0].points) - parseInt(d.points)}` : "LEADER";

            return (
              <motion.div
                key={d.Driver.driverId}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className={`relative flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-all group cursor-default ${isFav ? 'bg-[var(--f1-red)]/5' : ''}`}
              >
                {/* Team accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-60" style={{ background: teamColor }} />

                {/* Position */}
                <div className="font-orbitron font-black text-lg w-6 text-center shrink-0 opacity-80"
                  style={{ color: getPositionColor(pos) }}>
                  {pos}
                </div>

                {/* Driver Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-bold text-xs text-white tracking-wide uppercase truncate">
                      {d.Driver.familyName}
                    </span>
                    <span className="font-mono text-[8px] text-[var(--f1-gray-light)] px-1.5 py-0.5 border border-white/10">
                      {d.Driver.code}
                    </span>
                    {isFav && <Star size={10} className="text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-tight truncate mt-0.5 uppercase">
                    {d.Constructors[0]?.name}
                  </div>
                </div>

                {/* Gap / Points */}
                <div className="text-right shrink-0">
                  <div className="font-orbitron font-bold text-sm text-white tabular-nums">{d.points}</div>
                  <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-tighter uppercase font-bold opacity-60">
                    {gap}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.02] text-center">
        <button className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest hover:text-white transition-colors uppercase">
          VIEW FULL STANDINGS →
        </button>
      </div>
    </motion.div>
  );
}

