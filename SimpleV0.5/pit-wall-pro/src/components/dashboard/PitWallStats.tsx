"use client";

import { motion } from "framer-motion";
import { useF1Store } from "@/store/f1Store";
import { pad } from "@/lib/utils";

export function PitWallStats() {
  const { races, driverStandings, constructorStandings } = useF1Store();
  
  const totalRaces = races.length || 24;
  const completedRaces = races.filter(r => new Date(r.date) < new Date()).length;
  const progress = (completedRaces / totalRaces) * 100;
  
  const leader = driverStandings[0];
  const teamLeader = constructorStandings[0];

  return (
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatBlock 
        label="SEASON PROGRESS" 
        value={`${completedRaces}/${totalRaces}`} 
        sub="ROUNDS COMPLETED"
        progress={progress}
      />
      <StatBlock 
        label="CHAMPIONSHIP LEADER" 
        value={leader?.Driver.familyName.toUpperCase() || "TBD"} 
        sub={`${leader?.points || 0} POINTS`}
        color="var(--f1-red)"
      />
      <StatBlock 
        label="CONSTRUCTORS LEADER" 
        value={teamLeader?.Constructor.name.toUpperCase() || "TBD"} 
        sub={`${teamLeader?.points || 0} POINTS`}
        color="var(--f1-white)"
      />
      <StatBlock 
        label="SYSTEM UPTIME" 
        value="99.9%" 
        sub="ENCRYPTED FEED"
        isLive
      />
    </div>
  );
}

function StatBlock({ label, value, sub, progress, color, isLive }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
      style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
    >
      <div className="font-mono text-[8px] tracking-[0.4em] text-[var(--f1-gray-light)] mb-3 uppercase">{label}</div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-orbitron font-black text-2xl tracking-tighter text-white" style={{ color }}>
            {value}
          </div>
          <div className="font-mono text-[9px] text-[var(--f1-gray-light)] mt-1 tracking-widest">{sub}</div>
        </div>
        {isLive && <span className="live-dot mb-2" />}
      </div>
      
      {progress !== undefined && (
        <div className="mt-4 h-1 w-full bg-white/5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-[var(--f1-red)]"
          />
        </div>
      )}
      
      {/* Tech accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10" />
    </motion.div>
  );
}
