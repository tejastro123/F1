"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFastF1 } from "@/hooks/useFastF1";
import { useSessionStore } from "@/store/sessionStore";
import { getDriverColor, getTeamColorFastF1 } from "@/lib/driver-colors";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Legend, LineChart, Line
} from "recharts";
import { SessionSelector } from "@/components/ui/SessionSelector";
import { History as HistoryIcon, TrendingUp, Award, Calculator, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { getSeasonResults, getSeasonSummary, loading } = useFastF1();
  const { year: globalYear } = useSessionStore();
  const [selectedYear, setSelectedYear] = useState(globalYear);
  
  const [seasonResults, setSeasonResults] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"matrix" | "progression" | "standings">("matrix");

  useEffect(() => {
    async function loadData() {
      const [results, summ] = await Promise.all([
        getSeasonResults(selectedYear),
        getSeasonSummary(selectedYear)
      ]);
      if (results) setSeasonResults(results);
      if (summ) setStandings(summ);
    }
    loadData();
  }, [selectedYear, getSeasonResults, getSeasonSummary]);

  // Points Progression Data
  const progressionData = useMemo(() => {
    const drivers = Array.from(new Set(seasonResults.map(r => r.driverCode))).slice(0, 10);
    const rounds = Array.from(new Set(seasonResults.map(r => r.round))).sort((a, b) => a - b);
    
    const accumulated: Record<string, number> = {};
    drivers.forEach(d => accumulated[d] = 0);

    return rounds.map(rnd => {
      const row: any = { round: `R${rnd}` };
      drivers.forEach(drv => {
        const res = seasonResults.find(r => r.driverCode === drv && r.round === rnd);
        accumulated[drv] += res ? parseFloat(res.points) : 0;
        row[drv] = accumulated[drv];
      });
      return row;
    });
  }, [seasonResults]);

  // Format Heatmap Data
  const heatmapData = useMemo(() => {
    const drivers = Array.from(new Set(seasonResults.map(r => r.driverCode))).slice(0, 15);
    const rounds = Array.from(new Set(seasonResults.map(r => r.round))).sort((a, b) => a - b);
    
    return drivers.map(drv => {
      const row: any = { driver: drv };
      rounds.forEach(rnd => {
        const res = seasonResults.find(r => r.driverCode === drv && r.round === rnd);
        row[`R${rnd}`] = res ? parseInt(res.position) : null;
      });
      return row;
    });
  }, [seasonResults]);

  const rounds = Array.from(new Set(seasonResults.map(r => `R${r.round}`))).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  const years = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 2026 - i);

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold uppercase animate-pulse">Archival_Systems_Linked</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase italic">
            Season_<span className="text-[var(--f1-red)]">Vault</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-4 border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg">
          <div className="relative group">
            <label className="absolute -top-2 left-3 px-1 bg-black text-[9px] font-mono text-[var(--f1-red)] tracking-widest uppercase">Archive_Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-black border border-white/10 text-white font-mono text-xs p-3 pr-8 outline-none appearance-none hover:border-[var(--f1-red)] transition-colors min-w-[140px]"
            >
              {years.map(y => (
                <option key={y} value={y}>{y} SEASON</option>
              ))}
            </select>
          </div>
          <div className="h-10 w-[1px] bg-white/5 mx-2" />
          <div className="flex gap-2">
            {[
              { id: "matrix", label: "Results Matrix", icon: HistoryIcon },
              { id: "progression", label: "Points Progression", icon: TrendingUp },
              { id: "standings", label: "Standings", icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 font-orbitron font-bold text-[9px] tracking-widest uppercase transition-all",
                  activeTab === tab.id ? "bg-[var(--f1-red)] text-white" : "bg-white/5 text-white/40 hover:text-white"
                )}
                style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === "matrix" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card-base p-8 overflow-x-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={18} className="text-[var(--f1-red)]" />
              <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Race_Result_Matrix</h3>
            </div>
            
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-2 text-[var(--f1-gray-light)]">DRIVER</th>
                  {rounds.map(r => (
                    <th key={r} className="py-4 px-1 text-center text-[var(--f1-gray-light)] w-10">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => (
                  <tr key={row.driver} className="border-b border-white/5 group hover:bg-white/[0.02]">
                    <td className="py-3 px-2 flex items-center gap-3">
                      <div className="w-1 h-4" style={{ backgroundColor: getDriverColor(row.driver) }} />
                      <span className="font-bold text-white group-hover:text-[var(--f1-red)] transition-colors">{row.driver}</span>
                    </td>
                    {rounds.map(r => {
                      const pos = row[r];
                      let bgColor = "transparent";
                      let textColor = "#8E8E93";
                      if (pos === 1) { bgColor = "#FCD700"; textColor = "black"; }
                      else if (pos === 2) { bgColor = "#C0C0C0"; textColor = "black"; }
                      else if (pos === 3) { bgColor = "#CD7F32"; textColor = "black"; }
                      else if (pos <= 10 && pos !== null) { bgColor = "rgba(255,255,255,0.1)"; textColor = "white"; }
                      
                      return (
                        <td key={r} className="py-3 px-1 text-center">
                          <div 
                            className="w-7 h-7 flex items-center justify-center rounded-sm mx-auto"
                            style={{ backgroundColor: bgColor, color: textColor, opacity: pos === null ? 0.2 : 1 }}
                          >
                            {pos || "—"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "progression" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card-base p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={18} className="text-[var(--f1-red)]" />
              <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Point_Accumulation_Timeline</h3>
            </div>
            <div className="h-[600px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="round" stroke="#8E8E93" tick={{fontSize: 10}} />
                  <YAxis stroke="#8E8E93" tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px'}} />
                  <Legend />
                  {Object.keys(progressionData[0] || {}).filter(k => k !== "round").map(drv => (
                    <Line 
                      key={drv} 
                      type="monotone" 
                      dataKey={drv} 
                      stroke={getDriverColor(drv)} 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 6 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === "standings" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card-base p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <Award size={18} className="text-[var(--f1-red)]" />
              <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Season_Final_Standings</h3>
            </div>
            <div className="space-y-2">
              {standings.map((d, i) => (
                <div key={d.driverId} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-[var(--f1-red)]/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="font-orbitron font-black text-2xl text-white/20 group-hover:text-white transition-colors w-10">
                      {String(d.position).padStart(2, '0')}
                    </div>
                    <div className="w-1.5 h-10" style={{ backgroundColor: getDriverColor(d.driverCode) }} />
                    <div>
                      <div className="font-orbitron font-bold text-sm text-white uppercase">{d.familyName}</div>
                      <div className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase">{d.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right w-20">
                      <div className="font-orbitron font-black text-xl text-white">{d.points}</div>
                      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">POINTS</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="card-base p-6 border border-dashed border-white/10 flex flex-col items-center text-center max-w-2xl">
          <ShieldAlert size={24} className="text-[var(--f1-red)] mb-3 animate-pulse" />
          <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase mb-2">Vault_Notice</h4>
          <p className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase leading-relaxed">
            Historical telemetry archives are subject to data availability. Data for the {selectedYear} season is fetched via Ergast/FastF1 uplink protocols.
          </p>
        </div>
      </div>
    </div>
  );
}
