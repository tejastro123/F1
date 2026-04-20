"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LiveDriver } from "@/types/f1";
import { getTireColor, cn } from "@/lib/utils";
import { Zap, ArrowUpRight } from "lucide-react";

interface Props { drivers: LiveDriver[]; }

const TIRE_LABEL: Record<string, string> = {
  SOFT: "S", MEDIUM: "M", HARD: "H", INTERMEDIATE: "I", WET: "W",
};

function TireBadge({ compound, age }: { compound: LiveDriver["tireCompound"]; age: number }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center font-orbitron font-black text-[10px] border-2"
        style={{ borderColor: getTireColor(compound), color: getTireColor(compound), background: `${getTireColor(compound)}15` }}
      >
        {TIRE_LABEL[compound]}
      </div>
      <span className="font-mono text-[9px] text-[var(--f1-gray-light)]">{age}L</span>
    </div>
  );
}

export function LiveLeaderboard({ drivers }: Props) {
  return (
    <div className="card-base overflow-hidden"
      style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
      {/* Header row */}
      <div className="grid grid-cols-[40px_60px_1fr_80px_80px_100px_100px_50px] gap-2 px-4 py-3 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
        {["POS","NO","DRIVER","INTERVAL","LAST LAP","SECTORS","TYRE / HEALTH","PIT"].map(h => (
          <div key={h} className="font-mono text-[9px] tracking-widest text-[var(--f1-gray-light)] uppercase">{h}</div>
        ))}
      </div>

      <AnimatePresence>
        {drivers.map((d, i) => {
          const tireHealth = Math.max(0, 100 - (d.tireAge * (d.tireCompound === 'SOFT' ? 4 : d.tireCompound === 'MEDIUM' ? 3 : 2)));
          
          return (
            <motion.div
              key={`${i}-${d.driverNumber}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "relative grid grid-cols-[40px_60px_1fr_80px_80px_100px_100px_50px] gap-2 items-center px-4 py-3 border-b border-[var(--f1-gray)]",
                "hover:bg-white/[0.02] transition-colors",
                d.position === 1 && "bg-[rgba(252,215,0,0.04)]"
              )}
            >
              {/* Left team bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: d.teamColor }} />

              {/* Position */}
              <div className="font-orbitron font-black text-base"
                style={{ color: d.position === 1 ? "#FCD700" : d.position === 2 ? "#C0C0C0" : d.position === 3 ? "#CD7F32" : "#fff" }}>
                {String(d.position).padStart(2, "0")}
              </div>

              {/* Car number */}
              <div className="font-mono text-[11px] font-bold text-white px-2 py-0.5 rounded text-center"
                style={{ background: `${d.teamColor}30`, border: `1px solid ${d.teamColor}60` }}>
                #{d.driverNumber}
              </div>

              {/* Driver */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-rajdhani font-bold text-sm text-white uppercase tracking-wide">
                    {d.driverCode}
                  </span>
                  {d.drsActive && (
                    <span className="font-mono text-[8px] text-green-400 border border-green-400/40 bg-green-400/10 px-1 py-0.5">DRS</span>
                  )}
                </div>
                <div className="font-mono text-[8px] text-[var(--f1-gray-light)] truncate uppercase">{d.teamName.replace("_", " ")}</div>
              </div>

              {/* Interval */}
              <div className="font-mono text-[11px] font-bold text-[var(--f1-red)]">
                {d.position === 1 ? <span className="text-[var(--gold)]">LEADER</span> : d.interval}
              </div>

              {/* Last lap */}
              <div className="font-mono text-[10px] text-white font-bold">{d.lastLap}</div>

              {/* Sectors */}
              <div className="flex items-center gap-1">
                {[d.sector1, d.sector2, d.sector3].map((s, idx) => (
                  <div key={idx} className={cn(
                    "h-4 w-6 flex items-center justify-center font-mono text-[8px] border",
                    s.includes('*') ? "border-purple-500 bg-purple-500/10 text-purple-400" : 
                    s.includes('+') ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-400/60" :
                    "border-green-500/40 bg-green-500/10 text-green-400"
                  )}>
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Tyre / Health */}
              <div className="space-y-1.5">
                <TireBadge compound={d.tireCompound} age={d.tireAge} />
                <div className="w-full h-1 bg-[var(--f1-gray)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${tireHealth}%` }}
                    className={cn(
                      "h-full rounded-full",
                      tireHealth > 70 ? "bg-green-500" : tireHealth > 30 ? "bg-yellow-500" : "bg-red-500"
                    )}
                  />
                </div>
              </div>

              {/* Pit stops */}
              <div className="font-mono text-[11px] text-[var(--f1-gray-light)] text-center">
                {d.pitStops}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
