"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFastF1 } from "@/hooks/useFastF1";
import { useSessionStore } from "@/store/sessionStore";
import { getDriverColor } from "@/lib/driver-colors";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList, ComposedChart, Line, Area
} from "recharts";
import { SessionSelector } from "@/components/ui/SessionSelector";
import { Award, Calculator, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChampionshipPage() {
  const { getWdcScenarios, getWccScenarios, getSeasonSummary, loading } = useFastF1();
  const { year } = useSessionStore();
  const [activeTab, setActiveTab] = useState<"wdc" | "wcc" | "simulator">("wdc");
  const [wdcData, setWdcData] = useState<any>(null);
  const [wccData, setWccData] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const [wdc, wcc, summ] = await Promise.all([
        getWdcScenarios(year, 4),
        getWccScenarios(year, 4),
        getSeasonSummary(year)
      ]);
      if (wdc) setWdcData(wdc);
      if (wcc) setWccData(wcc);
      if (summ) setStandings(summ);
    }
    loadData();
  }, [year, getWdcScenarios, getWccScenarios, getSeasonSummary]);

  const activeScenarios = activeTab === "wdc" ? wdcData : wccData;
  const leaderPoints = (activeTab === "wdc" ? wdcData?.drivers : wccData?.teams)?.[0]?.points || 0;

  const chartData = useMemo(() => {
    const list = activeTab === "wdc" ? wdcData?.drivers : wccData?.teams;
    return (list || []).slice(0, 15).map((d: any) => ({
      ...d,
      label: activeTab === "wdc" ? d.driver : d.team,
      gap: leaderPoints - d.points,
      possible: d.max_possible
    }));
  }, [activeTab, wdcData, wccData, leaderPoints]);

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold uppercase animate-pulse">Championship_Matrix_v5.0</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase italic">
            Title_<span className="text-[var(--f1-red)]">Scenarios</span>
          </h1>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
          {[
            { id: "wdc", label: "Drivers (WDC)", icon: Award },
            { id: "wcc", label: "Teams (WCC)", icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 font-orbitron font-bold text-[10px] tracking-widest uppercase transition-all",
                activeTab === tab.id ? "bg-[var(--f1-red)] text-white shadow-[0_0_15px_rgba(255,24,1,0.3)]" : "text-white/40 hover:text-white"
              )}
              style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Championship Gap Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-8 card-base p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-[var(--f1-red)]" />
              <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Point_Deficit_to_Leader</h3>
            </div>
            <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase">
              Current_Round: 04 / 24
            </div>
          </div>
          
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={chartData} margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide reversed />
                <YAxis dataKey="label" type="category" stroke="white" tick={{fontSize: 10, fontWeight: 'bold'}} width={80} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px'}}
                  formatter={(val: any) => [val === 0 ? "LEADER" : `-${val} PTS`, 'GAP']}
                />
                <Bar dataKey="gap" radius={[4, 0, 0, 4]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={activeTab === "wdc" ? getDriverColor(entry.driver) : "#FF1801"} 
                    />
                  ))}
                  <LabelList 
                    dataKey="points" 
                    position="left" 
                    fill="white" 
                    fontSize={12} 
                    fontFamily="Orbitron" 
                    fontWeight="bold"
                    offset={10} 
                    formatter={(v: any) => `${v} PTS`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Math Panel */}
        <div className="xl:col-span-4 space-y-6">
          <div className="card-base p-8 border-l-4 border-l-[var(--f1-red)] bg-gradient-to-br from-[var(--f1-red)]/10 to-transparent">
            <div className="flex items-center gap-3 mb-8">
              <Calculator size={18} className="text-[var(--f1-red)]" />
              <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">The_Math_of_Winning</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-black/40 border border-white/10">
                <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase mb-2">Remaining Points Pool</div>
                <div className="font-orbitron font-black text-4xl text-white tracking-widest">
                  {activeScenarios?.max_remaining_points || 0}
                </div>
                <div className="h-1 w-full bg-white/10 mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 2 }}
                    className="h-full bg-[var(--f1-red)]" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase mb-4">
                  {activeTab === "wdc" ? "Driver" : "Team"} Mathematical Viability
                </div>
                {chartData.slice(0, 8).map((d: any) => (
                  <div key={d.label} className="flex items-center justify-between p-3 bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1.5 h-6" 
                        style={{ backgroundColor: activeTab === "wdc" ? getDriverColor(d.driver) : "#FF1801" }} 
                      />
                      <div>
                        <div className="font-orbitron font-bold text-xs text-white uppercase">{d.label}</div>
                        <div className="font-mono text-[8px] text-[var(--f1-gray-light)]">MAX_POTENTIAL: {d.possible}</div>
                      </div>
                    </div>
                    {d.can_win ? (
                      <div className="flex items-center gap-1.5 text-green-500 font-mono text-[9px] font-bold uppercase">
                        <ShieldCheck size={12} /> Eligible
                      </div>
                    ) : (
                      <div className="text-red-500 font-mono text-[9px] font-bold uppercase">Eliminated</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-base p-6 border border-dashed border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Target size={16} className="text-[var(--f1-red)]" />
              <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Target_Clinch_Gap</h4>
            </div>
            <p className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase leading-relaxed mb-4">
              To mathematically clinch the {activeTab === "wdc" ? "WDC" : "WCC"} at the next round, the leader needs a gap of at least {activeScenarios?.max_remaining_points - (activeTab === "wdc" ? 26 : 44)} points.
            </p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-[var(--f1-red)]/20 w-1/3" />
            </div>
          </div>

          <div className="card-base p-6 border border-white/5 bg-gradient-to-t from-black/40 to-transparent flex flex-col items-center text-center">
            <Calculator size={20} className="text-[var(--f1-red)] mb-3" />
            <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase mb-2">Sim_Uplink_v5.2</h4>
            <p className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase leading-relaxed">
              Predictive modeling accounts for Sprint race points, Fastest Lap bonuses, and the 24-round 2026 calendar structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
