"use client";

import { useF1Data } from "@/hooks/useF1Data";
import { useF1Store } from "@/store/f1Store";
import { useUserStore } from "@/store/f1Store";
import { motion } from "framer-motion";
import { getTeamColor, getPositionColor } from "@/lib/utils";
import { Star, Users } from "lucide-react";

export default function DriversPage() {
  const { isLoading } = useF1Data();
  const { driverStandings } = useF1Store();
  const { profile, setFavoriteDriver } = useUserStore();

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Users size={24} className="text-[var(--f1-red)]" />
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          DRIVERS&apos; CHAMPIONSHIP
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
        <span className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest">2024 SEASON</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {driverStandings.map((d, i) => {
            const teamColor = getTeamColor(d.Constructors[0]?.constructorId);
            const pos = parseInt(d.position);
            const isFav = d.Driver.driverId === profile.favoriteDriver;

            return (
              <motion.div
                key={d.Driver.driverId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative p-0 border-2 bg-gradient-to-br from-[var(--f1-dark)] to-[var(--f1-black)] overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                style={{
                  borderColor: isFav ? teamColor : "var(--f1-gray)",
                  clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)"
                }}
                onClick={() => setFavoriteDriver(d.Driver.driverId)}
              >
                {/* Team color top bar */}
                <div className="h-1.5 w-full" style={{ background: teamColor }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="font-orbitron font-black text-5xl leading-none"
                      style={{ color: getPositionColor(pos) }}>
                      P{pos}
                    </div>
                    <div className="flex items-center gap-2">
                      {isFav && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
                      <div className="font-orbitron font-bold text-xs text-white px-3 py-1.5"
                        style={{
                          background: teamColor,
                          clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)"
                        }}>
                        {d.Driver.code}
                      </div>
                    </div>
                  </div>

                  <div className="font-rajdhani font-bold text-xl text-white uppercase tracking-wide mb-1">
                    {d.Driver.givenName} {d.Driver.familyName}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-4">
                    {d.Constructors[0]?.name} · #{d.Driver.permanentNumber || "—"}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mb-1">POINTS</div>
                      <div className="font-orbitron font-black text-3xl text-white">{d.points}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mb-1">WINS</div>
                      <div className="font-orbitron font-bold text-2xl text-[var(--f1-red)]">{d.wins}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mb-1">NAT</div>
                      <div className="font-mono text-sm text-white">{d.Driver.nationality.substring(0, 3).toUpperCase()}</div>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
