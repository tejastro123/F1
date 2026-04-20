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
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="border border-white/10 bg-white/[0.01] backdrop-blur-md overflow-hidden relative"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}
    >
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="font-orbitron font-bold text-sm text-white tracking-[0.2em]">CONSTRUCTORS</div>
          <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-[0.3em] mt-1 uppercase font-bold">WORLD CHAMPIONSHIP</div>
        </div>
        <div className="h-2 w-2 rounded-full bg-[var(--f1-red)] animate-pulse" />
      </div>

      <div className="divide-y divide-white/5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
              <div className="skeleton w-6 h-6 rounded opacity-20" />
              <div className="flex-1 space-y-2">
                <div className="skeleton w-32 h-4 rounded opacity-20" />
                <div className="skeleton w-full h-1.5 rounded opacity-10" />
              </div>
              <div className="skeleton w-12 h-6 rounded opacity-20" />
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
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`relative flex items-center gap-4 px-6 py-5 hover:bg-white/[0.03] transition-all group ${isFav ? 'bg-[var(--f1-red)]/5' : ''}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-60" style={{ background: teamColor }} />

                <div className="font-orbitron font-black text-lg w-6 text-center shrink-0 opacity-80"
                  style={{ color: getPositionColor(pos) }}>
                  {pos}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-orbitron font-bold text-xs text-white tracking-wide uppercase">
                      {t.Constructor.name}
                    </span>
                    {isFav && <Star size={10} className="text-yellow-500 fill-yellow-500" />}
                  </div>
                  
                  {/* Points bar */}
                  <div className="relative h-1 bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 1 }}
                      className="absolute top-0 left-0 h-full"
                      style={{ background: teamColor }}
                    />
                  </div>
                  <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.1em] mt-2 uppercase font-bold opacity-60">
                    {t.wins} WINS · {t.points} PTS
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-orbitron font-black text-sm text-white tabular-nums">
                    {Math.round(pct)}%
                  </div>
                  <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase tracking-tighter">SHARE</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      
      <div className="p-4 border-t border-white/5 bg-white/[0.02] text-center">
        <button className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest hover:text-white transition-colors uppercase">
          CHAMPIONSHIP ANALYTICS →
        </button>
      </div>
    </motion.div>
  );
}

