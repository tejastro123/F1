import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useDrivers, useConstructors, useStats } from '../hooks/useData.js';
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

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Stats & Analytics" subtitle="Deep dive into the 2026 championship data" />

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Quick stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
              >
                <Card className="text-center">
                  <div className="text-2xl font-black text-f1-gold"><AnimatedCounter value={stats.totalPointsDistributed} /></div>
                  <div className="text-xs text-gray-400 mt-1">Total Points</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-black text-white"><AnimatedCounter value={stats.totalDrivers} /></div>
                  <div className="text-xs text-gray-400 mt-1">Drivers</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-black text-green-400"><AnimatedCounter value={stats.racesDone} /></div>
                  <div className="text-xs text-gray-400 mt-1">Races Done</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-black text-f1-red">{stats.leaderName?.split(' ').pop()}</div>
                  <div className="text-xs text-gray-400 mt-1">Leader</div>
                </Card>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Points gap chart */}
              <Card>
                <h3 className="font-bold text-lg mb-4">Points Gap to Leader</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gapData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                      <XAxis type="number" stroke="#666" />
                      <YAxis type="category" dataKey="name" stroke="#666" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="points" name="Points" radius={[0, 4, 4, 0]}>
                        {gapData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Wins distribution */}
              <Card>
                <h3 className="font-bold text-lg mb-4">Wins Distribution</h3>
                <div className="h-72">
                  {winsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={winsData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name.split(' ').pop()} (${value})`}
                          labelLine={{ stroke: '#666' }}
                        >
                          {winsData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No wins data yet
                    </div>
                  )}
                </div>
              </Card>

              {/* Team radar chart */}
              <Card className="md:col-span-2">
                <h3 className="font-bold text-lg mb-4">Team Performance Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#2a2a3a" />
                      <PolarAngleAxis dataKey="team" stroke="#666" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis stroke="#666" />
                      <Tooltip content={<CustomTooltip />} />
                      <Radar name="Points" dataKey="points" stroke="#E10600" fill="#E10600" fillOpacity={0.2} />
                      <Radar name="Wins" dataKey="wins" stroke="#F5C518" fill="#F5C518" fillOpacity={0.1} />
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
