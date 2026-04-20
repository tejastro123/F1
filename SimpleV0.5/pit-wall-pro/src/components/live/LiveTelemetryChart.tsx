"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import type { LiveDriver } from "@/types/f1";
import { BarChart3 } from "lucide-react";

interface Props {
  drivers: LiveDriver[];
  height?: number;
}

function generateSpeedData(drivers: LiveDriver[]) {
  return Array.from({ length: 20 }, (_, i) => {
    const point: Record<string, number | string> = { lap: i + 1 };
    drivers.forEach(d => {
      point[d.driverCode] = Math.floor(270 + Math.random() * 80 + (drivers.indexOf(d) * -5));
    });
    return point;
  });
}

const COLORS = ["#E10600", "#FF8700", "#27F4D2", "#0600EF", "#DC0000"];

export function LiveTelemetryChart({ drivers, height = 260 }: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const speedData = useMemo(() => generateSpeedData(drivers), [drivers.length]);

  if (!mounted) {
    return <div className="h-[260px] w-full bg-[rgba(225,6,0,0.06)] animate-pulse mt-6" />;
  }

  return (
    <div className="mt-6 card-base overflow-hidden"
      style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
      <div className="flex items-center gap-3 px-6 py-5 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
        <BarChart3 size={16} className="text-[var(--f1-red)]" />
        <div>
          <div className="font-orbitron font-bold text-base text-white tracking-widest">SPEED TELEMETRY</div>
          <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">TOP 5 DRIVERS · KM/H</div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={speedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              {drivers.map((d, i) => (
                <linearGradient key={d.driverCode} id={`grad-${d.driverCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }}
              label={{ value: "LAP", position: "insideBottom", fill: "#8E8E93", fontSize: 10 }} />
            <YAxis tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }}
              domain={[240, 380]} />
            <Tooltip
              contentStyle={{ background: "#15151E", border: "1px solid #E10600", borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 11 }}
              labelStyle={{ color: "#E10600", fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10, paddingTop: 12 }} />
            {drivers.map((d, i) => (
              <Area
                key={d.driverCode}
                type="monotone"
                dataKey={d.driverCode}
                stroke={COLORS[i]}
                fill={`url(#grad-${d.driverCode})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: COLORS[i] }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
