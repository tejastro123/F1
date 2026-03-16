import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useDrivers, useConstructors, useStats } from '../hooks/useData.jsx';
import { Card, SectionHeader, AnimatedCounter, SkeletonCard } from '../components/ui.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function Stats() {
  const { drivers, loading: driversLoading } = useDrivers();
  const { constructors, loading: constructorsLoading } = useConstructors();
  const { stats, loading: statsLoading } = useStats();

  const loading = driversLoading || constructorsLoading || statsLoading;

  // Points gap bar chart data
  const gapData = useMemo(() => {
    if (!drivers.length) return [];
    const leader = drivers[0]?.points || 0;
    return drivers.slice(0, 10).map(d => ({
      name: d.fullName.split(' ').pop(),
      gap: leader - d.points,
      points: d.points,
      color: getTeamColor(d.team),
    }));
  }, [drivers]);

  // Wins distribution pie
  const winsData = useMemo(() => {
    return drivers.filter(d => d.wins > 0).map(d => ({
      name: d.fullName,
      value: d.wins,
      color: getTeamColor(d.team),
    }));
  }, [drivers]);

  // Team performance radar
  const radarData = useMemo(() => {
    return constructors.slice(0, 6).map(c => ({
      team: c.teamName,
      points: c.points,
      wins: c.wins * 25,
      podiums: c.podiums * 15,
    }));
  }, [constructors]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-f1-card border border-white/10 rounded-lg p-3 text-sm">
        <p className="text-white font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-400">{p.name}: <span className="text-white font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Stats & Analytics — F1 2026</title>
        <meta name="description" content="Deep analytics and statistics for the 2026 Formula 1 season" />
      </Helmet>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title="ANALYTICS" subtitle="Deep-space telemetry and championship trajectories" />

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Quick Stats - Command Center */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Total Points', value: stats.totalPointsDistributed, icon: '⚡' },
                  { label: 'The Grid', value: stats.totalDrivers, icon: '👤' },
                  { label: 'Races Done', value: stats.racesDone, icon: '🚦' },
                  { label: 'Leader', value: stats.leaderName?.split(' ').pop(), icon: '🏆', isText: true }
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card glass className="p-6 text-center border-white/5 rounded-[2rem] shadow-xl">
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">{s.label}</div>
                      <div className="text-3xl font-black text-white italic tracking-tighter">
                        {s.isText ? s.value : <AnimatedCounter value={s.value} />}
                      </div>
                      <div className="mt-3 text-lg opacity-20">{s.icon}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-10">
              {/* Points gap chart - Refined */}
              <Card glass className="rounded-[2.5rem] p-8 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10">Leader Gap (Points)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gapData} layout="vertical" margin={{ left: -20 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" width={100} tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="points" name="Points" radius={[0, 15, 15, 0]} barSize={20}>
                        {gapData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Wins distribution - Refined */}
              <Card glass className="rounded-[2.5rem] p-8 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10">Win Share %</h3>
                <div className="h-80">
                  {winsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={winsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {winsData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm">
                      <span className="text-4xl mb-4">🏁</span>
                      Season records pending...
                    </div>
                  )}
                </div>
              </Card>

              {/* Team radar chart - Immersion */}
              <Card glass className="md:col-span-2 rounded-[3.5rem] p-12 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-12 text-center">Constructor Performance Profile</h3>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="team" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }} />
                      <PolarRadiusAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Radar name="Points" dataKey="points" stroke="#E10600" fill="#E10600" fillOpacity={0.2} strokeWidth={3} />
                      <Radar name="Wins" dataKey="wins" stroke="#F5C518" fill="#F5C518" fillOpacity={0.1} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
