"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { DriverStanding } from "@/types/f1";
import { getTeamColor } from "@/lib/utils";

import { useState, useEffect } from "react";

interface Props {
  drivers: DriverStanding[];
}

export function SeasonAnalyticsPreview({ drivers }: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[240px] w-full bg-white/[0.02] animate-pulse mb-12" />;
  }

  // Mock trend data for top 3 drivers
  const data = [
    { round: 1, p1: 25, p2: 18, p3: 15 },
    { round: 2, p1: 43, p2: 36, p3: 30 },
    { round: 3, p1: 68, p2: 51, p3: 45 },
    { round: 4, p1: 93, p2: 76, p3: 60 },
    { round: 5, p1: 118, p2: 101, p3: 75 },
    { round: 6, p1: 143, p2: 119, p3: 93 },
  ];

  const topDrivers = drivers.slice(0, 3);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-white/10" />
        <h2 className="font-orbitron font-bold text-[10px] text-white tracking-[0.4em] uppercase">
          CHAMPIONSHIP_TRAJECTORY
        </h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Chart Area */}
        <div className="p-8 border border-white/5 bg-white/[0.01] backdrop-blur-sm relative overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}>

          <div className="flex items-center justify-between mb-8">
            <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              POINTS_ACCUMULATION_CURVE
            </div>
            <div className="flex gap-4">
              {topDrivers.map((d, i) => (
                <div key={d.Driver.driverId} className="flex items-center gap-2">
                  <div className="w-2 h-2" style={{ backgroundColor: getTeamColor(d.Constructors[0]?.constructorId) }} />
                  <span className="font-mono text-[9px] text-white uppercase">{d.Driver.code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data}>
                <defs>
                  {topDrivers.map((d, i) => (
                    <linearGradient key={d.Driver.driverId} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getTeamColor(d.Constructors[0]?.constructorId)} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={getTeamColor(d.Constructors[0]?.constructorId)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="round"
                  tick={{ fill: "#8E8E93", fontSize: 9, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "#8E8E93", fontSize: 9, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", fontSize: "10px", fontFamily: "JetBrains Mono" }}
                />
                {topDrivers.map((d, i) => (
                  <Area
                    key={d.Driver.driverId}
                    type="monotone"
                    dataKey={`p${i + 1}`}
                    stroke={getTeamColor(d.Constructors[0]?.constructorId)}
                    fillOpacity={1}
                    fill={`url(#grad${i})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tactical Feed */}
        <div className="flex flex-col gap-4">
          <TacticalBlock label="TOP_SPEED_AVG" value="342.4" unit="KM/H" trend="+1.2%" />
          <TacticalBlock label="TIRE_WEAR_INDEX" value="0.42" unit="RATIO" trend="-0.05" />
          <TacticalBlock label="FUEL_EFFICIENCY" value="98.2" unit="%" trend="OPTIMAL" />
          <div className="flex-1 border border-[var(--f1-red)]/20 bg-[var(--f1-red)]/[0.02] p-5 flex flex-col justify-center">
            <div className="font-orbitron font-bold text-[9px] text-[var(--f1-red)] tracking-[0.2em] mb-2 uppercase">STRATEGY_ALERT</div>
            <div className="font-mono text-[10px] text-white leading-relaxed uppercase">
              HIGH CHANCE OF RAIN DETECTED FOR UPCOMING SESSION. ADJUST COOLING MAPPING.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TacticalBlockProps {
  label: string;
  value: string;
  unit: string;
  trend: string;
}

function TacticalBlock({ label, value, unit, trend }: TacticalBlockProps) {
  return (
    <div className="p-5 border border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-widest uppercase mb-2">{label}</div>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-orbitron font-black text-xl text-white">{value}</span>
          <span className="font-mono text-[9px] text-[var(--f1-gray-light)]">{unit}</span>
        </div>
        <span className="font-mono text-[9px] text-white/40">{trend}</span>
      </div>
    </div>
  );
}
