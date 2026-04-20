"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LiveDriver } from "@/types/f1";
import { getTireColor, cn } from "@/lib/utils";

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
    <div className="card-base overflow-hidden relative group"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}>
      
      {/* Decorative tech scanline animation */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--f1-red)]/20 animate-scanline pointer-events-none" />

      {/* Header row */}
      <div className="grid grid-cols-[40px_60px_1fr_90px_90px_110px_110px_50px] gap-4 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        {["POS","NO","DRIVER","INTERVAL","LAST_LAP","SECTORS","TYRE_INFO","PIT"].map(h => (
          <div key={h} className="font-mono text-[9px] tracking-[0.2em] text-[var(--f1-gray-light)] uppercase font-bold">{h}</div>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {drivers.map((d, i) => {
          const tireHealth = Math.max(0, 100 - (d.tireAge * (d.tireCompound === 'SOFT' ? 4 : d.tireCompound === 'MEDIUM' ? 3 : 2)));
          
          return (
            <motion.div
              key={`${i}-${d.driverNumber}`}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative grid grid-cols-[40px_60px_1fr_90px_90px_110px_110px_50px] gap-4 items-center px-6 py-4 border-b border-white/5",
                "hover:bg-[var(--f1-red)]/[0.03] transition-all duration-200 group/row",
                d.position === 1 && "bg-[rgba(252,215,0,0.02)]"
              )}
            >
              {/* Left team accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover/row:opacity-100 transition-opacity" style={{ backgroundColor: d.teamColor }} />

              {/* Position */}
              <div className="font-orbitron font-black text-lg italic tracking-tighter"
                style={{ color: d.position === 1 ? "var(--gold)" : d.position === 2 ? "var(--silver)" : d.position === 3 ? "var(--bronze)" : "#fff" }}>
                {d.position}
              </div>

              {/* Car number */}
              <div className="font-mono text-[10px] font-black text-white px-2 py-1 text-center bg-white/5 border border-white/10"
                style={{ borderColor: `${d.teamColor}40` }}>
                {d.driverNumber}
              </div>

              {/* Driver Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                    {d.driverCode}
                  </span>
                  {d.drsActive && (
                    <motion.span 
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="font-mono text-[8px] text-[#27F4D2] border border-[#27F4D2]/40 bg-[#27F4D2]/10 px-1.5 py-0.5"
                    >
                      DRS
                    </motion.span>
                  )}
                </div>
                <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase tracking-widest mt-0.5">
                  {d.teamName.replace("_", " ")}
                </div>
              </div>

              {/* Interval */}
              <div className={cn(
                "font-mono text-[11px] font-bold tracking-tight",
                d.position === 1 ? "text-[var(--gold)]" : "text-[var(--f1-red)]"
              )}>
                {d.position === 1 ? "LEADER" : `+${d.interval}`}
              </div>

              {/* Last lap */}
              <div className="font-mono text-[10px] text-white font-bold tracking-wider">
                {d.lastLap}
              </div>

              {/* Sectors HUD */}
              <div className="flex items-center gap-1.5">
                {[d.sector1, d.sector2, d.sector3].map((s, idx) => {
                  const isPurple = s.includes('*');
                  const isYellow = s.includes('+');
                  return (
                    <div key={idx} className={cn(
                      "flex-1 h-5 flex items-center justify-center font-mono text-[8px] font-bold border",
                      isPurple ? "border-purple-500 bg-purple-500/20 text-purple-400" : 
                      isYellow ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400/50" :
                      "border-green-500/30 bg-green-500/10 text-green-400"
                    )}>
                      S{idx + 1}
                    </div>
                  );
                })}
              </div>

              {/* Tyre HUD */}
              <div className="flex items-center gap-3">
                <TireBadge compound={d.tireCompound} age={d.tireAge} />
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      tireHealth > 70 ? "bg-green-500" : tireHealth > 30 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${tireHealth}%` }}
                  />
                </div>
              </div>

              {/* Pit stops */}
              <div className="font-mono text-[10px] text-[var(--f1-gray-light)] text-center font-bold">
                {d.pitStops}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
