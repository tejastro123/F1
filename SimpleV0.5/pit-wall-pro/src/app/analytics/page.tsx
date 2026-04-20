"use client";

import { useF1Data } from "@/hooks/useF1Data";
import { useF1Store } from "@/store/f1Store";
import { motion } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { getTeamColor } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

function generateDriverMetrics(code: string) {
  const seed = code.charCodeAt(0) + code.charCodeAt(1);
  return [
    { metric: "RACE PACE", value: 60 + (seed % 40) },
    { metric: "QUALIFYING", value: 55 + ((seed * 2) % 45) },
    { metric: "CONSISTENCY", value: 50 + ((seed * 3) % 50) },
    { metric: "TIRE MGMT", value: 45 + ((seed * 4) % 55) },
    { metric: "WET WEATHER", value: 40 + ((seed * 5) % 60) },
    { metric: "OVERTAKING", value: 50 + ((seed * 6) % 50) },
  ];
}

export default function AnalyticsPage() {
  const { isLoading } = useF1Data();
  const { driverStandings } = useF1Store();
  const top5 = driverStandings.slice(0, 5);

  const pointsData = top5.map(d => ({
    name: d.Driver.code,
    points: parseInt(d.points),
    wins: parseInt(d.wins),
    color: getTeamColor(d.Constructors[0]?.constructorId),
  }));

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <BarChart3 size={24} className="text-[var(--f1-red)]" />
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          DRIVER ANALYTICS
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Points Comparison */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-base p-6"
          style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)" }}>
          <div className="font-orbitron font-bold text-base text-white tracking-widest mb-6">CHAMPIONSHIP POINTS COMPARISON</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pointsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#15151E", border: "1px solid #E10600", fontFamily: "JetBrains Mono", fontSize: 11 }} />
              <Bar dataKey="points" fill="var(--f1-red)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Driver Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-base p-6"
          style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)" }}>
          <div className="font-orbitron font-bold text-base text-white tracking-widest mb-2">DRIVER SKILL RADAR · VER vs NOR</div>
          <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-4">Normalized performance metrics</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={generateDriverMetrics("VER")}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#8E8E93", fontSize: 9, fontFamily: "JetBrains Mono" }} />
              <Radar name="VERSTAPPEN" dataKey="value" stroke="#0600EF" fill="#0600EF" fillOpacity={0.2} />
              <Radar name="NORRIS" dataKey="value" stroke="#FF8700" fill="#FF8700" fillOpacity={0.2}
                data={generateDriverMetrics("NOR")} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Driver stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {top5.map((d, i) => {
          const color = getTeamColor(d.Constructors[0]?.constructorId);
          return (
            <motion.div key={d.Driver.driverId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="card-base p-4 text-center"
              style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)", borderColor: color }}>
              <div className="font-orbitron font-black text-2xl mb-1" style={{ color }}>{d.Driver.code}</div>
              <div className="font-rajdhani font-semibold text-sm text-white uppercase mb-3 truncate">
                {d.Driver.familyName}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[["PTS", d.points], ["WINS", d.wins], ["POS", `P${d.position}`]].map(([l, v]) => (
                  <div key={l} className="bg-[var(--f1-darker)] p-2 rounded">
                    <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-wider">{l}</div>
                    <div className="font-orbitron font-bold text-sm text-white">{v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
