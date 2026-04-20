"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useF1Data } from "@/hooks/useF1Data";
import { useF1Store } from "@/store/f1Store";
import { fetchSeasonComparison } from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { History, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AVAILABLE_SEASONS = ["2024", "2023", "2022", "2021", "2020"];

export default function HistoryPage() {
  const { driverStandings } = useF1Store();
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["2024", "2023"]);

  // Mock multi-season champions data for visualization
  const championsData = [
    { year: "2020", driver: "HAM", points: 347, team: "mercedes" },
    { year: "2021", driver: "VER", points: 395, team: "red_bull" },
    { year: "2022", driver: "VER", points: 454, team: "red_bull" },
    { year: "2023", driver: "VER", points: 575, team: "red_bull" },
    { year: "2024", driver: driverStandings[0]?.Driver.code || "VER", points: parseInt(driverStandings[0]?.points || "437"), team: driverStandings[0]?.Constructors[0]?.constructorId || "red_bull" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <History size={24} className="text-[var(--f1-red)]" />
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          HISTORICAL DATA
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
      </div>

      {/* Season Selector */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest">COMPARE SEASONS:</span>
        {AVAILABLE_SEASONS.map(season => (
          <button key={season}
            onClick={() => setSelectedSeasons(p => p.includes(season) ? p.filter(s => s !== season) : [...p, season])}
            className={`px-4 py-2 border font-mono text-[11px] tracking-widest transition-all ${
              selectedSeasons.includes(season)
                ? "border-[var(--f1-red)] bg-[rgba(225,6,0,0.1)] text-white"
                : "border-[var(--f1-gray)] text-[var(--f1-gray-light)] hover:border-[var(--f1-red)]"
            }`}
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
            {season}
          </button>
        ))}
      </div>

      {/* Champions Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card-base p-6 mb-6"
        style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
        <div className="font-orbitron font-bold text-base text-white tracking-widest mb-6">
          WDC POINTS PROGRESSION 2020–2024
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={championsData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <YAxis tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ background: "#15151E", border: "1px solid #E10600", fontFamily: "JetBrains Mono", fontSize: 11 }} />
            <Line type="monotone" dataKey="points" stroke="var(--f1-red)" strokeWidth={2.5}
              dot={{ fill: "var(--f1-red)", r: 5 }} activeDot={{ r: 7 }}
              label={{ position: "top", fill: "#fff", fontSize: 10, fontFamily: "JetBrains Mono",
                formatter: (v: number, entry: { payload?: { driver?: string } }) => entry?.payload?.driver || "" }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Champions grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {championsData.map((c, i) => (
          <motion.div key={c.year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 border-2 bg-[var(--f1-dark)] text-center"
            style={{
              borderColor: getTeamColor(c.team),
              clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)"
            }}>
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-2">{c.year}</div>
            <div className="font-orbitron font-black text-3xl mb-1" style={{ color: getTeamColor(c.team) }}>
              {c.driver}
            </div>
            <div className="font-orbitron font-bold text-lg text-white">{c.points}</div>
            <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">PTS</div>
          </motion.div>
        ))}
      </div>

      {/* Recent season header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-[var(--f1-red)]">
        <TrendingUp size={18} className="text-[var(--f1-red)]" />
        <h2 className="font-orbitron font-bold text-xl text-white tracking-widest">2024 FINAL STANDINGS</h2>
      </div>

      <div className="card-base overflow-hidden"
        style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)" }}>
        {driverStandings.map((d, i) => {
          const color = getTeamColor(d.Constructors[0]?.constructorId);
          return (
            <div key={d.Driver.driverId}
              className="relative flex items-center gap-4 px-5 py-3 border-b border-[var(--f1-gray)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: color }} />
              <div className="font-orbitron font-bold text-sm w-6 text-right" style={{ color: i < 3 ? ["#FCD700", "#C0C0C0", "#CD7F32"][i] : "#fff" }}>
                {d.position}
              </div>
              <span className="font-mono text-[10px] text-white px-1.5 py-0.5 font-bold"
                style={{ background: color, clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)" }}>
                {d.Driver.code}
              </span>
              <div className="flex-1 font-rajdhani font-semibold text-sm text-white uppercase">
                {d.Driver.givenName} {d.Driver.familyName}
              </div>
              <div className="font-mono text-[11px] text-[var(--f1-gray-light)] hidden md:block">{d.Constructors[0]?.name}</div>
              <div className="font-mono text-[11px] text-[var(--f1-red)]">{d.wins} WINS</div>
              <div className="font-orbitron font-bold text-sm text-white w-12 text-right">{d.points}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
