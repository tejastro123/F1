import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useConstructors } from '../hooks/useData.js';
import { AnimatedCounter, Card, SectionHeader, SkeletonCard } from '../components/ui.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function Constructors() {
  const { constructors, loading } = useConstructors();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return constructors.filter(c =>
      c.teamName.toLowerCase().includes(search.toLowerCase())
    );
  }, [constructors, search]);

  const totalPoints = useMemo(() => constructors.reduce((sum, c) => sum + c.points, 0), [constructors]);

  const pieData = useMemo(() => {
    return constructors.filter(c => c.points > 0).map(c => ({
      name: c.teamName,
      value: c.points,
      color: getTeamColor(c.teamName),
    }));
  }, [constructors]);

  return (
    <>
      <Helmet>
        <title>Constructor Standings — F1 2026</title>
        <meta name="description" content="2026 Formula 1 Constructor Championship standings" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Constructor Standings" subtitle="2026 Formula 1 Championship" />

        {/* Search */}
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-f1-card border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-f1-red/50 mb-8 w-full max-w-sm"
          aria-label="Search constructors"
        />

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <h3 className="text-lg font-bold mb-4">Points Share</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1C1C28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value, name) => [`${value} pts (${totalPoints > 0 ? Math.round((value / totalPoints) * 100) : 0}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-400 truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Constructor cards */}
            <div className="lg:col-span-2 space-y-4">
              {filtered.map((team, idx) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-f1-card rounded-xl border border-white/5 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Team color bar */}
                    <div className="w-1.5" style={{ backgroundColor: getTeamColor(team.teamName) }} />

                    <div className="flex-1 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-black ${idx === 0 ? 'text-f1-gold' : 'text-white'}`}>
                            {team.rank}
                          </span>
                          <div>
                            <h3 className="font-bold text-lg" style={{ color: getTeamColor(team.teamName) }}>
                              {team.teamName}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black">
                            <AnimatedCounter value={team.points} />
                          </div>
                          <div className="text-xs text-gray-400">POINTS</div>
                        </div>
                      </div>

                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-400">Wins </span>
                          <span className="font-bold text-white">{team.wins}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Podiums </span>
                          <span className="font-bold text-white">{team.podiums}</span>
                        </div>
                        {totalPoints > 0 && (
                          <div>
                            <span className="text-gray-400">Share </span>
                            <span className="font-bold text-white">{Math.round((team.points / totalPoints) * 100)}%</span>
                          </div>
                        )}
                      </div>

                      {/* Points bar */}
                      <div className="w-full bg-f1-dark rounded-full h-1.5 mt-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: getTeamColor(team.teamName) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${totalPoints > 0 ? (team.points / totalPoints) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
