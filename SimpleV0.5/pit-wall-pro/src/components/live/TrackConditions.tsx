"use client";

import { Thermometer, Wind, Droplets, Sun } from "lucide-react";
import type { LiveRaceState } from "@/types/f1";

export function TrackConditions({ race }: { race: LiveRaceState }) {
  const metrics = [
    { label: "TRACK TEMP", value: `${race.trackTemp}°C`, icon: Thermometer, color: "#FF8700" },
    { label: "AIR TEMP", value: `${race.airTemp}°C`, icon: Sun, color: "#FCD700" },
    { label: "HUMIDITY", value: `${race.humidity}%`, icon: Droplets, color: "#27F4D2" },
    { label: "WIND", value: `${race.windSpeed} km/h`, icon: Wind, color: "#8E8E93" },
  ];

  return (
    <div className="card-base overflow-hidden"
      style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)" }}>
      <div className="px-5 py-4 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
        <div className="font-orbitron font-bold text-sm text-white tracking-widest">TRACK CONDITIONS</div>
        <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mt-0.5">{race.trackName}</div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[var(--f1-gray)]">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--f1-dark)] p-4 text-center">
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <div className="font-orbitron font-bold text-xl text-white mb-1">{value}</div>
            <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-[var(--f1-gray)]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">DRS STATUS</span>
          <span className={`font-orbitron font-bold text-xs px-3 py-1 border ${
            race.drsEnabled
              ? "border-green-500 bg-green-500/10 text-green-400"
              : "border-red-500 bg-red-500/10 text-red-400"
          }`}
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
            {race.drsEnabled ? "ENABLED" : "DISABLED"}
          </span>
        </div>
      </div>
    </div>
  );
}
