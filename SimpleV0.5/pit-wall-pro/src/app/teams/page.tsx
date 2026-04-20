"use client";

import { useF1Data } from "@/hooks/useF1Data";
import { useF1Store } from "@/store/f1Store";
import { useUserStore } from "@/store/f1Store";
import { motion } from "framer-motion";
import { getTeamColor, getPositionColor } from "@/lib/utils";
import { Building2, Star } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function TeamsPage() {
  const { isLoading } = useF1Data();
  const { constructorStandings } = useF1Store();
  const { profile, setFavoriteTeam } = useUserStore();

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Building2 size={24} className="text-[var(--f1-red)]" />
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          CONSTRUCTORS&apos; CHAMPIONSHIP
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
        <span className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest uppercase">2026 Season</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {constructorStandings.map((t, i) => {
            const color = getTeamColor(t.Constructor.constructorId);
            const isFav = t.Constructor.constructorId === profile.favoriteTeam;
            const pos = parseInt(t.position);
            const maxPts = parseInt(constructorStandings[0]?.points || "1");
            const pct = (parseInt(t.points) / maxPts) * 100;

            return (
              <motion.div
                key={t.Constructor.constructorId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setFavoriteTeam(t.Constructor.constructorId)}
                className="relative p-0 border-2 bg-gradient-to-br from-[var(--f1-dark)] to-[var(--f1-black)] overflow-hidden hover:-translate-y-1 transition-all cursor-pointer"
                style={{
                  borderColor: isFav ? color : "var(--f1-gray)",
                  clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)"
                }}
              >
                {/* Color bar */}
                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="font-orbitron font-black text-4xl mb-1" style={{ color: getPositionColor(pos) }}>
                        P{pos}
                      </div>
                      {isFav && (
                        <div className="flex items-center gap-1 font-mono text-[9px] text-yellow-400 tracking-widest">
                          <Star size={10} className="fill-yellow-400" /> FAVORITE
                        </div>
                      )}
                    </div>
                    <div className="font-orbitron font-black text-3xl" style={{ color }}>
                      {t.Constructor.name.split(" ").pop()?.toUpperCase()}
                    </div>
                  </div>

                  <div className="font-rajdhani font-bold text-lg text-white uppercase tracking-wide mb-4">
                    {t.Constructor.name}
                  </div>

                  {/* Points bar */}
                  <div className="mb-3">
                    <div className="flex justify-between font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mb-1.5">
                      <span>POINTS</span>
                      <span>{Math.round(pct)}% OF LEADER</span>
                    </div>
                    <div className="h-2 bg-[var(--f1-gray)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-orbitron font-black text-3xl text-white">{t.points}</div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">PTS</div>
                    </div>
                    <div className="text-right">
                      <div className="font-orbitron font-bold text-xl text-[var(--f1-red)]">{t.wins}</div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">WINS</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-white">{t.Constructor.nationality.substring(0, 3).toUpperCase()}</div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">NAT</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
