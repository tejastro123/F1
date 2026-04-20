"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFastF1, LapData } from "@/hooks/useFastF1";
import { useSessionStore } from "@/store/sessionStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis,
  Cell, Legend, LineChart, Line
} from "recharts";
import { getDriverColor, getTeamColorFastF1, getTireColor } from "@/lib/driver-colors";
import { BarChart3, TrendingUp, Users, Award, Timer } from "lucide-react";
import { SessionSelector } from "@/components/ui/SessionSelector";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const {
    getLapDistribution, getTeamPace, getSeasonResults,
    getSeasonSummary, getWdcScenarios, getWccScenarios, loading
  } = useFastF1();
  const { year, event } = useSessionStore();

  const [lapDist, setLapDist] = useState<LapData[]>([]);
  const [teamPace, setTeamPace] = useState<any[]>([]);
  const [seasonResults, setSeasonResults] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [wdcScenarios, setWdcScenarios] = useState<any>(null);
  const [wccScenarios, setWccScenarios] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      // Find current round from results
      const results = await getSeasonResults(year);
      if (results) {
        setSeasonResults(results);
        const currentRound = Math.max(...results.map((r: any) => r.round));

        const [dist, pace, summ, wdc, wcc] = await Promise.all([
          getLapDistribution(year, event),
          getTeamPace(year, event),
          getSeasonSummary(year),
          getWdcScenarios(year, currentRound),
          getWccScenarios(year, currentRound)
        ]);

        if (dist) setLapDist(dist);
        if (pace) setTeamPace(pace);
        if (summ) setStandings(summ);
        if (wdc) setWdcScenarios(wdc);
        if (wcc) setWccScenarios(wcc);
      }
    }
    loadData();
  }, [year, event, getLapDistribution, getTeamPace, getSeasonResults, getSeasonSummary, getWdcScenarios, getWccScenarios]);

  // Format Season Results for Heatmap-style Line Chart
  const seasonPointsData = useMemo(() => {
    if (!seasonResults.length) return [];
    const rounds = Array.from(new Set(seasonResults.map(r => r.round))).sort((a: any, b: any) => a - b);
    const drivers = Array.from(new Set(seasonResults.map(r => r.driverCode))).slice(0, 10);

    return rounds.map(rnd => {
      const data: any = { round: `R${rnd}` };
      drivers.forEach(drv => {
        const res = seasonResults.find(r => r.round === rnd && r.driverCode === drv);
        data[drv] = res ? res.points : 0;
      });
      return data;
    });
  }, [seasonResults]);

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold uppercase animate-pulse">Strategic_Intelligence_Active</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase italic">
            Advanced_<span className="text-[var(--f1-red)]">Analytics</span>
          </h1>
        </div>

        <SessionSelector />
      </div>

      {/* Championship Scenarios Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card-base p-6 border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <div className="flex items-center gap-3 mb-4">
            <Award size={18} className="text-yellow-500" />
            <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Title_Contention</h4>
          </div>
          <div className="font-orbitron font-black text-2xl text-white tracking-tighter">
            {(wdcScenarios?.drivers || []).filter((d: any) => d.can_win).length || 0} <span className="text-xs text-white/40 uppercase font-bold">Drivers Active</span>
          </div>
          <p className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase mt-2">WDC Calculation @ Max Points Available: {wdcScenarios?.max_remaining_points || 0} PTS</p>
        </div>

        <div className="card-base p-6 border-l-4 border-l-blue-500 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-4">
            <Users size={18} className="text-blue-500" />
            <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Constructor_Battle</h4>
          </div>
          <div className="font-orbitron font-black text-2xl text-white tracking-tighter">
            {(wccScenarios?.teams || []).filter((t: any) => t.can_win).length || 0} <span className="text-xs text-white/40 uppercase font-bold">Teams Active</span>
          </div>
          <p className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase mt-2">WCC Calculation @ Remaining: {wccScenarios?.max_remaining_points || 0} PTS</p>
        </div>

        <div className="card-base p-6 border-l-4 border-l-[var(--f1-red)] bg-[var(--f1-red)]/5">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={18} className="text-[var(--f1-red)]" />
            <h4 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Season_Progression</h4>
          </div>
          <div className="font-orbitron font-black text-2xl text-white tracking-tighter">
            {seasonResults.length ? Math.max(...seasonResults.map((r: any) => r.round)) : 0} / 24 <span className="text-xs text-white/40 uppercase font-bold">Rounds Complete</span>
          </div>
          <p className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase mt-2 italic">PitWall_AI_Simulation_Stable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
        {/* Team Pace Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-4 card-base p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={18} className="text-[var(--f1-red)]" />
            <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Team_Pace_Hierarchy</h3>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={teamPace} margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <YAxis dataKey="Team" type="category" stroke="white" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} width={80} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                  formatter={(val: any) => [`${val.toFixed(3)}s`, 'Median Lap']}
                />
                <Bar dataKey="LapTimeSeconds" radius={[0, 4, 4, 0]}>
                  {teamPace.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTeamColorFastF1(entry.Team)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 font-mono text-[9px] text-[var(--f1-gray-light)] uppercase text-center tracking-widest italic">
            * Lower values indicate faster median race pace
          </p>
        </motion.div>

        {/* Lap Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="xl:col-span-8 card-base p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Timer size={18} className="text-[var(--f1-red)]" />
            <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Lap_Consistency_Envelope</h3>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="category" dataKey="driver" name="Driver" stroke="#8E8E93" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="lap_time" name="Time" domain={['auto', 'auto']} stroke="#8E8E93" tick={{ fontSize: 10 }} />
                <ZAxis type="number" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                />
                {Array.from(new Set(lapDist.map(d => d.driver))).map((drv, i) => (
                  <Scatter
                    key={drv}
                    name={drv}
                    data={lapDist.filter(d => d.driver === drv)}
                    fill={getDriverColor(drv)}
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Season Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="xl:col-span-8 card-base p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={18} className="text-[var(--f1-red)]" />
            <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Season_Point_Accumulation</h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seasonPointsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="round" stroke="#8E8E93" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8E8E93" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }} />
                {Object.keys(seasonPointsData[0] || {}).filter(k => k !== 'round').map((drv) => (
                  <Line
                    key={drv}
                    type="monotone"
                    dataKey={drv}
                    stroke={getDriverColor(drv)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Standing Quick Stats */}
        <div className="xl:col-span-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Award size={18} className="text-[var(--f1-red)]" />
            <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">WDC_Standings_Snapshot</h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[440px] pr-2 custom-scrollbar">
            {standings.map((d, i) => {
              const scenario = wdcScenarios?.drivers.find((s: any) => s.driver === d.driverCode);
              const isEliminated = scenario && !scenario.can_win;

              return (
                <div
                  key={d.driverId}
                  className={cn(
                    "flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-[var(--f1-red)]/30 transition-all group relative overflow-hidden",
                    isEliminated && "opacity-40 grayscale"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-orbitron font-black text-xl text-white/20 group-hover:text-white transition-colors">
                      {String(d.position).padStart(2, '0')}
                    </div>
                    <div className="w-1 h-8" style={{ backgroundColor: getDriverColor(d.driverCode) }} />
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white uppercase flex items-center gap-2">
                        {d.familyName}
                        {isEliminated && <span className="text-[7px] bg-red-600 px-1 font-black text-white rounded-sm">OUT</span>}
                      </div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase truncate max-w-[120px]">{d.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-orbitron font-black text-sm text-white">{d.points}</div>
                    <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

}