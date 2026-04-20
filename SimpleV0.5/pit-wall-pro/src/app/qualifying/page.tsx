"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFastF1 } from "@/hooks/useFastF1";
import { useSessionStore } from "@/store/sessionStore";
import { getDriverColor } from "@/lib/driver-colors";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList
} from "recharts";
import { SessionSelector } from "@/components/ui/SessionSelector";
import { Zap, Timer, Award, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QualifyingPage() {
  const { getQualifying, loading } = useFastF1();
  const { year, event } = useSessionStore();
  const [qualifyingData, setQualifyingData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getQualifying(year, event);
      if (data) {
        // Sort by position
        const sorted = [...data].sort((a, b) => (a.position || 99) - (b.position || 99));
        setQualifyingData(sorted);
      }
    }
    loadData();
  }, [year, event, getQualifying]);

  const poleTime = qualifyingData[0]?.best_lap || 0;

  const chartData = useMemo(() => {
    return qualifyingData.slice(0, 10).map(d => ({
      ...d,
      gap: d.best_lap ? (d.best_lap - poleTime).toFixed(3) : null,
      displayTime: d.best_lap ? formatTime(d.best_lap) : "DNF/DNS"
    }));
  }, [qualifyingData, poleTime]);

  const segmentLeaders = useMemo(() => {
    if (qualifyingData.length === 0) return { q1: null, q2: null, q3: null };

    const q1Leader = [...qualifyingData].filter(d => d.q1).sort((a, b) => a.q1 - b.q1)[0];
    const q2Leader = [...qualifyingData].filter(d => d.q2).sort((a, b) => a.q2 - b.q2)[0];
    const q3Leader = qualifyingData[0]; // Already sorted by position/best_lap which is Q3 for top 10

    return { q1: q1Leader, q2: q2Leader, q3: q3Leader };
  }, [qualifyingData]);

  function formatTime(seconds: number | null) {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  }

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold uppercase animate-pulse">Pole_Position_Uplink</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase italic">
            Qualifying_<span className="text-[var(--f1-red)]">Results</span>
          </h1>
        </div>

        <SessionSelector />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] card-base border-dashed border-white/10">
          <Zap size={48} className="text-[var(--f1-red)] animate-pulse mb-6" />
          <div className="font-orbitron font-bold text-xl text-white tracking-widest uppercase mb-2">Fetching_2026_Data</div>
          <p className="font-mono text-xs text-[var(--f1-gray-light)] uppercase tracking-widest">Establishing satellite uplink to {event}...</p>
        </div>
      ) : qualifyingData.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] card-base border-dashed border-white/10">
          <Flag size={48} className="text-white/10 mb-6" />
          <div className="font-orbitron font-bold text-xl text-white tracking-widest uppercase mb-2">No_Session_Data</div>
          <p className="font-mono text-xs text-[var(--f1-gray-light)] uppercase tracking-widest text-center max-w-md">
            The selected 2026 session has not taken place or data is currently being indexed by the archive server.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
            {/* Horizontal Bar Chart (Top 10 Shootout) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-8 card-base p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-[var(--f1-red)]" />
                  <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Q3_Shootout_Delta</h3>
                </div>
                {qualifyingData[0] && (
                  <div className="px-4 py-2 bg-white/5 border border-white/10 font-mono text-[10px]">
                    <span className="text-[var(--f1-gray-light)] uppercase mr-2">Pole Time:</span>
                    <span className="text-white font-bold">{formatTime(poleTime)}</span>
                  </div>
                )}
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData} margin={{ left: 40, right: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide domain={[poleTime * 0.95, 'dataMax + 0.1']} />
                    <YAxis dataKey="driver" type="category" stroke="white" tick={{ fontSize: 10, fontWeight: 'bold' }} width={60} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                      formatter={(_val: any, _name: any, props: any) => [props.payload.gap === "0.000" ? "POLE" : `+${props.payload.gap}s`, 'GAP']}
                    />
                    <Bar dataKey="best_lap" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getDriverColor(entry.driver)} />
                      ))}
                      <LabelList
                        dataKey="displayTime"
                        position="right"
                        fill="white"
                        fontSize={10}
                        fontFamily="JetBrains Mono"
                        offset={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Quick Highlights */}
            <div className="xl:col-span-4 space-y-6">
              <div className="card-base p-8 border-l-4 border-l-[var(--f1-red)] bg-gradient-to-br from-[var(--f1-red)]/5 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={18} className="text-[var(--f1-red)]" />
                  <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Session_Leaders</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-black/40 border border-white/5">
                    <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase mb-2">POLE POSITION</div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-10" style={{ backgroundColor: getDriverColor(segmentLeaders.q3?.driver) }} />
                      <div>
                        <div className="font-orbitron font-black text-2xl text-white uppercase">{segmentLeaders.q3?.driver || "—"}</div>
                        <div className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase">{segmentLeaders.q3?.team}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5">
                      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase mb-1">Q2 Leader</div>
                      <div className="font-orbitron font-bold text-sm text-white">{segmentLeaders.q2?.driver || "—"}</div>
                      <div className="font-mono text-[9px] text-white/40">{formatTime(segmentLeaders.q2?.q2)}</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5">
                      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase mb-1">Q1 Leader</div>
                      <div className="font-orbitron font-bold text-sm text-white">{segmentLeaders.q1?.driver || "—"}</div>
                      <div className="font-mono text-[9px] text-white/40">{formatTime(segmentLeaders.q1?.q1)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-base p-6 border border-dashed border-white/10 text-center">
                <Timer size={24} className="text-[var(--f1-red)] mx-auto mb-3" />
                <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase mb-2">Track_Evolution</h4>
                <p className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase leading-relaxed">
                  Track temp: 34°C | Humidity: 42%<br />
                  Significant grip improvement observed between Q1 and Q3.
                </p>
              </div>
            </div>
          </div>

          {/* Full Results Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card-base p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <Flag size={18} className="text-[var(--f1-red)]" />
              <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Full_Grid_Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-white/10 text-[var(--f1-gray-light)]">
                    <th className="py-4 px-2">POS</th>
                    <th className="py-4 px-2">DRIVER</th>
                    <th className="py-4 px-2">Q1</th>
                    <th className="py-4 px-2">Q2</th>
                    <th className="py-4 px-2">Q3</th>
                    <th className="py-4 px-2">BEST</th>
                    <th className="py-4 px-2">GAP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {qualifyingData.map((d, i) => {
                    const gap = d.best_lap ? (d.best_lap - poleTime).toFixed(3) : null;

                    return (
                      <tr key={d.driver} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-2 font-orbitron font-bold text-sm">
                          {String(d.position || i + 1).padStart(2, '0')}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-4" style={{ backgroundColor: getDriverColor(d.driver) }} />
                            <div>
                              <div className="font-bold text-white uppercase">{d.driver}</div>
                              <div className="text-[9px] text-[var(--f1-gray-light)] uppercase">{d.team}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-white/60">{formatTime(d.q1)}</td>
                        <td className="py-4 px-2 text-white/60">{formatTime(d.q2)}</td>
                        <td className="py-4 px-2 text-white">{formatTime(d.q3)}</td>
                        <td className="py-4 px-2 font-bold text-[var(--f1-red)]">{formatTime(d.best_lap)}</td>
                        <td className="py-4 px-2 font-bold">
                          {gap === "0.000" ? <span className="text-[var(--f1-red)]">POLE</span> : `+${gap}s`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
