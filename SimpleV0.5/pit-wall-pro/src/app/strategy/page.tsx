"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFastF1, StrategySimulationResult } from "@/hooks/useFastF1";
import { useSessionStore } from "@/store/sessionStore";
import { getDriverColor, getTireColor } from "@/lib/driver-colors";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { SessionSelector } from "@/components/ui/SessionSelector";
import { Repeat, Zap, Layers, TrendingUp, Timer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_LAPS_MAP: Record<string, number> = {
  "Bahrain": 57, "Saudi Arabia": 50, "Australia": 58, "Japan": 53, "China": 56,
  "Miami": 57, "Emilia Romagna": 63, "Monaco": 78, "Canada": 70, "Spain": 66,
  "Austria": 71, "Great Britain": 52, "Hungary": 70, "Belgium": 44, "Netherlands": 72,
  "Italy": 53, "Azerbaijan": 51, "Singapore": 62, "United States": 56, "Mexico": 71,
  "Brazil": 71, "Las Vegas": 50, "Qatar": 57, "Abu Dhabi": 58
};

interface Stint {
  Driver: string;
  Stint: number;
  Compound: string;
  StintLength: number;
}

interface SimStint {
  compound: string;
  laps: number;
}

export default function StrategyPage() {
  const { getActualStrategy, getStrategySimulation, loading } = useFastF1();
  const { year, event } = useSessionStore();

  const [actualStints, setActualStints] = useState<Stint[]>([]);
  const [activeView, setActiveView] = useState<"actual" | "simulation">("actual");

  // Simulator State
  const [simStints, setSimStints] = useState<SimStint[]>([
    { compound: "SOFT", laps: 15 },
    { compound: "MEDIUM", laps: 20 },
    { compound: "HARD", laps: 22 }
  ]);
  const [simResult, setSimResult] = useState<StrategySimulationResult | null>(null);

  const totalLaps = TOTAL_LAPS_MAP[event] || 57;

  useEffect(() => {
    async function loadData() {
      const stints = await getActualStrategy(year, event);
      if (stints) setActualStints(stints);
    }
    loadData();
  }, [year, event, getActualStrategy]);

  useEffect(() => {
    async function runSim() {
      if (activeView === "simulation") {
        const res = await getStrategySimulation(year, event, simStints);
        if (res) setSimResult(res);
      }
    }
    runSim();
  }, [simStints, activeView, year, event, getStrategySimulation]);

  const stintChartData = useMemo(() => {
    const drivers = Array.from(new Set(actualStints.map(s => s.Driver))).slice(0, 12);
    return drivers.map(drv => {
      const drvStints = actualStints.filter(s => s.Driver === drv).sort((a, b) => a.Stint - b.Stint);
      const data: Record<string, string | number> = { driver: drv };
      drvStints.forEach((s, i) => {
        data[`stint${i + 1}`] = s.StintLength;
        data[`compound${i + 1}`] = s.Compound;
      });
      return data;
    });
  }, [actualStints]);

  const addStint = () => {
    if (simStints.length < 5) {
      setSimStints([...simStints, { compound: "MEDIUM", laps: 10 }]);
    }
  };

  const removeStint = (idx: number) => {
    setSimStints(simStints.filter((_, i) => i !== idx));
  };

  const updateStint = (idx: number, field: string, value: any) => {
    const newStints = [...simStints];
    newStints[idx][field] = value;
    setSimStints(newStints);
  };

  const totalSimLaps = simStints.reduce((acc, s) => acc + s.laps, 0);

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold uppercase animate-pulse">Tactical_Command_Active</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase italic">
            Race_<span className="text-[var(--f1-red)]">Strategy</span>
          </h1>
        </div>
        <SessionSelector />
      </div>

      {loading && activeView === "actual" ? (
        <div className="flex flex-col items-center justify-center min-h-[600px] card-base border-dashed border-white/10">
          <Layers size={48} className="text-[var(--f1-red)] animate-pulse mb-6" />
          <div className="font-orbitron font-bold text-xl text-white tracking-widest uppercase mb-2">Tactical_Sync_Active</div>
          <p className="font-mono text-xs text-[var(--f1-gray-light)] uppercase tracking-widest">Processing 2026 stint telemetry for {event}...</p>
        </div>
      ) : activeView === "actual" && stintChartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[600px] card-base border-dashed border-white/10">
          <Repeat size={48} className="text-white/10 mb-6" />
          <div className="font-orbitron font-bold text-xl text-white tracking-widest uppercase mb-2">No_Tactical_Data</div>
          <p className="font-mono text-xs text-[var(--f1-gray-light)] uppercase tracking-widest text-center max-w-md">
            Tactical stint data for the 2026 {event} session is currently unavailable or still being indexed.
          </p>
        </div>
      ) : (
        <>
          {/* View Switcher */}
          <div className="flex gap-4 mb-8">
            {(
              [
                { id: "actual", label: "Actual Stints", icon: Layers },
                { id: "simulation", label: "Strategy Simulator", icon: Zap },
              ] as const
            ).map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 font-orbitron font-bold text-[10px] tracking-widest uppercase transition-all relative overflow-hidden",
                  activeView === view.id ? "text-white bg-[var(--f1-red)] shadow-[0_0_20px_rgba(255,24,1,0.3)]" : "text-white/40 hover:text-white bg-white/5"
                )}
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
              >
                <view.icon size={14} />
                {view.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {activeView === "actual" ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="xl:col-span-8 card-base p-8"
                >
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <Repeat size={18} className="text-[var(--f1-red)]" />
                      <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Race_Stint_Timeline</h3>
                    </div>
                    <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase">
                      TOTAL DISTANCE: {totalLaps} LAPS
                    </div>
                  </div>

                  <div className="h-[550px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={stintChartData}
                        margin={{ left: 40, right: 40 }}
                        barGap={8}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[0, totalLaps]} stroke="#8E8E93" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="driver" type="category" stroke="white" tick={{ fontSize: 10, fontWeight: 'bold' }} width={60} />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#0a0a0a] border border-white/10 p-4 font-mono text-[10px] shadow-2xl">
                                  <div className="text-[var(--f1-red)] mb-3 font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                                    {payload[0].payload.driver} STRATEGY_PROFILE
                                  </div>
                                  <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map(i => {
                                      const len = payload[0].payload[`stint${i}`];
                                      const comp = payload[0].payload[`compound${i}`];
                                      if (!len) return null;
                                      return (
                                        <div key={i} className="flex items-center justify-between gap-8">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTireColor(comp as string) }} />
                                            <span className="text-white">STINT {i}:</span>
                                          </div>
                                          <span className="text-[var(--f1-gray-light)] font-bold">{len} LAPS ({comp})</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {[1, 2, 3, 4, 5].map(i => (
                          <Bar key={i} dataKey={`stint${i}`} stackId="a" barSize={24}>
                            {stintChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getTireColor((entry[`compound${i}`] as string) || "")} />
                            ))}
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-white/5">
                    {['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'].map(c => (
                      <div key={c} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTireColor(c) }} />
                        <span className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase tracking-widest">{c}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="xl:col-span-4 space-y-6">
                  <div className="card-base p-8 border-l-4 border-l-[var(--f1-red)] bg-gradient-to-br from-[var(--f1-red)]/5 to-transparent">
                    <div className="flex items-center gap-3 mb-8">
                      <TrendingUp size={18} className="text-[var(--f1-red)]" />
                      <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Tactical_Observations</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 bg-black/40 border border-white/5">
                        <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase mb-2">Dominant Race Compound</div>
                        <div className="font-orbitron font-black text-2xl text-white tracking-widest uppercase">HARD [C1]</div>
                      </div>
                      <div className="space-y-3">
                        <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase mb-2">Optimal Stint Management</div>
                        {stintChartData.slice(0, 5).map((d) => (
                          <div key={d.driver} className="flex items-center justify-between p-3 bg-white/5 border border-white/5">
                            <span className="font-orbitron font-bold text-xs text-white uppercase">{d.driver}</span>
                            <span className="font-mono text-[9px] text-green-500 font-bold uppercase">Optimal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card-base p-6 border border-dashed border-white/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Timer size={24} className="text-[var(--f1-red)]" />
                    </div>
                    <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase mb-2">Degradation_Alert</h4>
                    <p className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase leading-relaxed">
                      High thermal degradation observed. Optimal pit window shifted 2 laps earlier for heavy fuel runners.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Strategy Builder */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1 card-base p-8"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <Zap size={18} className="text-[var(--f1-red)]" />
                    <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Strategy_Builder</h3>
                  </div>

                  <div className="space-y-6">
                    {simStints.map((stint, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/10 relative group">
                        <button
                          onClick={() => removeStint(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Stint {idx + 1}</span>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTireColor(stint.compound) }} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase block mb-1">Compound</label>
                            <select
                              value={stint.compound}
                              onChange={(e) => updateStint(idx, 'compound', e.target.value)}
                              className="w-full bg-black border border-white/10 text-white font-mono text-[10px] p-2 focus:border-[var(--f1-red)] outline-none"
                            >
                              {['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase block mb-1">Laps</label>
                            <input
                              type="number"
                              value={stint.laps}
                              onChange={(e) => updateStint(idx, 'laps', parseInt(e.target.value) || 1)}
                              className="w-full bg-black border border-white/10 text-white font-mono text-[10px] p-2 focus:border-[var(--f1-red)] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {simStints.length < 5 && (
                      <button
                        onClick={addStint}
                        className="w-full py-4 border border-dashed border-white/20 hover:border-white/40 text-[var(--f1-gray-light)] hover:text-white font-mono text-[10px] uppercase tracking-widest transition-all"
                      >
                        + Add New Stint
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Simulation Results */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 card-base p-8 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={18} className="text-[var(--f1-red)]" />
                      <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Predictive_Timeline</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase mb-1">Total Race Time</div>
                        <div className="font-orbitron font-black text-2xl text-[var(--f1-red)] uppercase tracking-tighter">
                          {simResult?.total_time_formatted || "Calculating..."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simulation Visualizer */}
                  <div className="flex-1 flex flex-col">
                    <div className="h-24 bg-white/5 border border-white/10 flex overflow-hidden relative mb-12">
                      {simStints.map((stint, idx) => {
                        const width = (stint.laps / Math.max(totalLaps, totalSimLaps)) * 100;
                        return (
                          <div
                            key={idx}
                            className="h-full relative group"
                            style={{ width: `${width}%`, backgroundColor: getTireColor(stint.compound), opacity: 0.8 }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center font-orbitron font-black text-[10px] text-white drop-shadow-lg opacity-40">
                              {stint.laps}L
                            </div>
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-black border border-white/10 p-2 font-mono text-[8px] whitespace-nowrap uppercase">
                                STINT {idx + 1}: {stint.compound} ({stint.laps} LAPS)
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Total Laps Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                        style={{ left: `${(totalLaps / Math.max(totalLaps, totalSimLaps)) * 100}%` }}
                      >
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 font-mono text-[8px] text-red-500 whitespace-nowrap font-bold">
                          RACE FINISH ({totalLaps} L)
                        </div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                      <div className="p-6 bg-[var(--f1-red)]/5 border border-[var(--f1-red)]/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Zap size={14} className="text-[var(--f1-red)]" />
                          <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Tactical_AI_Summary</h4>
                        </div>
                        <p className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase leading-relaxed">
                          {totalSimLaps < totalLaps ? (
                            <span className="text-red-500 font-bold">CRITICAL: STRATEGY DOES NOT REACH FULL RACE DISTANCE. ({totalLaps - totalSimLaps} LAPS REMAINING)</span>
                          ) : totalSimLaps > totalLaps ? (
                            <span className="text-yellow-500 font-bold">WARNING: OVER-ESTIMATED DISTANCE. ({totalSimLaps - totalLaps} LAPS OVER)</span>
                          ) : (
                            "OPTIMAL RACE DISTANCE REACHED. DEGRADATION MODEL PREDICTS STABLE PACE TOWARDS THE END OF STINT 3."
                          )}
                        </p>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Timer size={14} className="text-[var(--f1-red)]" />
                          <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Compound_Efficiency</h4>
                        </div>
                        <div className="space-y-2">
                          {simResult?.stints.map((s: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-mono text-[8px] text-white/60">STINT {i + 1} AVG:</span>
                              <span className="font-mono text-[8px] text-white font-bold">{s.avg_lap.toFixed(3)}s</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
