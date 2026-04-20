"use client";

import { motion } from "framer-motion";
import type { RaceStatus } from "@/types/f1";

interface Props {
  currentLap: number;
  totalLaps: number;
  timeElapsed: string;
  raceStatus: RaceStatus;
}

const STATUS_CONFIG: Record<RaceStatus, { label: string; color: string }> = {
  NOT_STARTED: { label: "NOT STARTED", color: "#8E8E93" },
  FORMATION_LAP: { label: "FORMATION LAP", color: "#FCD700" },
  RACING: { label: "RACE IN PROGRESS", color: "#00FF00" },
  SAFETY_CAR: { label: "SAFETY CAR", color: "#FF8700" },
  VIRTUAL_SAFETY_CAR: { label: "VIRTUAL SC", color: "#FCD700" },
  RED_FLAG: { label: "RED FLAG", color: "#E10600" },
  FINISHED: { label: "RACE FINISHED", color: "#00FF00" },
};

export function RaceProgress({ currentLap, totalLaps, timeElapsed, raceStatus }: Props) {
  const pct = (currentLap / totalLaps) * 100;
  const cfg = STATUS_CONFIG[raceStatus];

  return (
    <div className="mb-6 p-5 card-base"
      style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-1">CURRENT LAP</div>
            <div className="font-orbitron font-black text-4xl text-white">
              {currentLap}<span className="text-xl text-[var(--f1-gray-light)] ml-1">/ {totalLaps}</span>
            </div>
          </div>
          <div className="w-px h-12 bg-[var(--f1-gray)]" />
          <div>
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-1">ELAPSED</div>
            <div className="font-orbitron font-bold text-2xl text-white">{timeElapsed}</div>
          </div>
        </div>

        <div className="px-4 py-2 border font-orbitron font-bold text-sm tracking-widest"
          style={{
            borderColor: cfg.color,
            color: cfg.color,
            background: `${cfg.color}15`,
            clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)"
          }}>
          ● {cfg.label}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-[var(--f1-gray)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ background: `linear-gradient(90deg, var(--f1-red), ${cfg.color})` }}
        />
        {/* Lap markers */}
        {[25, 50, 75].map(mark => (
          <div key={mark} className="absolute top-0 bottom-0 w-px bg-[var(--f1-dark)]"
            style={{ left: `${mark}%` }} />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mt-1">
        <span>LAP 1</span>
        <span>{Math.round(pct)}% COMPLETE</span>
        <span>LAP {totalLaps}</span>
      </div>
    </div>
  );
}
