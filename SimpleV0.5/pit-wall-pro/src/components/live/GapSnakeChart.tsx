"use client";

import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TEAM_COLORS, type LiveDriver } from "@/types/f1";

interface GapDataPoint {
  lap: number;
  [driverCode: string]: number;
}

interface GapSnakeChartProps {
  drivers: LiveDriver[];
}

export function GapSnakeChart({ drivers }: GapSnakeChartProps) {
  // Generate mock gap data based on current driver positions for visualization
  const data = useMemo(() => {
    const laps = Array.from({ length: 15 }).map((_, i) => i + 1);
    return laps.map((lap) => {
      const point: GapDataPoint = { lap };
      drivers.slice(0, 10).forEach((d, idx) => {
        // Create a realistic-ish gap trend
        const baseGap = idx * 2.5;
        const variance = Math.sin((lap + idx) * 0.5) * 0.8;
        point[d.driverCode] = parseFloat((baseGap + variance).toFixed(2));
      });
      return point;
    });
  }, [drivers]);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] w-full bg-[var(--f1-black)]/50 animate-pulse" />;

  return (
    <div className="card-base p-6" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">INTERVAL_GAP_SNAKE</h3>
          <p className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mt-1">TIME DELTA RELATIVE TO P1 (SEC)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 border border-[var(--f1-gray)] bg-[var(--f1-black)] rounded-sm">
          <div className="w-1.5 h-1.5 bg-[var(--f1-red)] rounded-full animate-pulse" />
          <span className="font-mono text-[9px] text-white">REAL_TIME</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="lap" 
              tick={{ fill: "#8E8E93", fontSize: 9, fontFamily: "JetBrains Mono" }}
              label={{ value: 'LAPS', position: 'insideBottomRight', offset: -5, fill: '#8E8E93', fontSize: 9 }}
            />
            <YAxis 
              reversed
              tick={{ fill: "#8E8E93", fontSize: 9, fontFamily: "JetBrains Mono" }}
              label={{ value: 'GAP (S)', angle: -90, position: 'insideLeft', fill: '#8E8E93', fontSize: 9 }}
            />
            <Tooltip
              contentStyle={{ background: "rgba(13, 13, 13, 0.95)", border: "1px solid #38383F", borderRadius: "0", color: "#fff", fontFamily: "JetBrains Mono", fontSize: "10px" }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '9px', fontFamily: 'JetBrains Mono', paddingBottom: '20px' }}
            />
            {drivers.slice(0, 6).map((d) => (
              <Line
                key={d.driverCode}
                type="monotone"
                dataKey={d.driverCode}
                stroke={d.teamColor || TEAM_COLORS[d.teamName.toLowerCase().replace(' ', '_')] || '#fff'}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
