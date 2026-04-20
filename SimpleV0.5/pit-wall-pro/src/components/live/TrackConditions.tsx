"use client";

import { Thermometer, Wind, Droplets, Sun } from "lucide-react";
import type { LiveRaceState } from "@/types/f1";

export function TrackConditions({ race }: { race: LiveRaceState }) {
  const metrics = [
    { label: "TRACK_TEMP", value: `${race.trackTemp}°C`, icon: Thermometer, color: "#FF8700" },
    { label: "AIR_TEMP", value: `${race.airTemp}°C`, icon: Sun, color: "#FCD700" },
    { label: "HUMIDITY", value: `${race.humidity}%`, icon: Droplets, color: "#27F4D2" },
    { label: "WIND_SPEED", value: `${race.windSpeed} KM/H`, icon: Wind, color: "#8E8E93" },
  ];

  return (
    <div className="card-base overflow-hidden"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)" }}>
      <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02]">
        <div className="font-orbitron font-bold text-[10px] text-[var(--f1-red)] tracking-[0.4em] mb-1 uppercase">TRACK_ENVIRONMENT</div>
        <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">{race.trackName}</div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/5">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--f1-black)] p-6 group">
            <Icon size={20} className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color }} />
            <div className="font-orbitron font-black text-2xl text-white mb-1">{value}</div>
            <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.2em] uppercase">{label}</div>
          </div>
        ))}
      </div>

      <div className="px-6 py-5 border-t border-white/5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-[0.3em] uppercase">DRS_CONTROL</span>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${race.drsEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`font-orbitron font-bold text-[10px] tracking-widest ${race.drsEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {race.drsEnabled ? "ACTIVE" : "DISABLED"}
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${race.drsEnabled ? 'bg-green-500' : 'bg-red-500'} opacity-20`} style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
