import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useConstructors } from '../hooks/useData.jsx';
import { AnimatedCounter, Card, SectionHeader, SkeletonCard } from '../components/ui.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function Constructors() {
  const { constructors, loading } = useConstructors();
  const navigate = useNavigate();
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

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title="CONSTRUCTORS" subtitle="2026 World Constructors' Championship Battle" />

        {/* Search - Refined */}
        <div className="max-w-md mb-12">
           <Card glass className="p-2 border-white/10 rounded-2xl flex items-center group">
              <svg className="ml-4 text-gray-500 group-focus-within:text-f1-red transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                placeholder="Find a constructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none font-bold"
              />
           </Card>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <SkeletonCard className="lg:col-span-1 h-96" />
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Chart - Enhanced Glassmorphism */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <Card glass className="rounded-[2.5rem] p-8 border-white/5 shadow-2xl bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 text-center">Points Distribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} className="filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                        labelStyle={{ display: 'none' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        formatter={(value, name) => [`${value} PTS`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-8">
                  {pieData.slice(0, 10).map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }} />
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Constructor cards - Refined Layout */}
            <div className="lg:col-span-2 space-y-6">
              {filtered.map((team, idx) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/constructors/${team._id}`)}
                  className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden cursor-pointer hover:bg-white/[0.08] hover:border-white/20 transition-all group relative active:scale-[0.99] shadow-lg"
                >
                  <div className="flex items-stretch min-h-[140px]">
                    {/* Team color accent */}
                    <div className="w-2.5" style={{ backgroundColor: getTeamColor(team.teamName) }} />

                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                          <span className={`text-4xl font-black italic ${idx === 0 ? 'text-f1-gold' : 'text-white/20'}`}>
                            {team.rank}
                          </span>
                          <div>
                            <h3 className="font-black text-2xl uppercase italic tracking-tighter leading-none group-hover:text-f1-red transition-colors" style={{ color: idx === 0 ? '' : getTeamColor(team.teamName) }}>
                              {team.teamName}
                            </h3>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 flex gap-4">
                               <span>Wins: {team.wins}</span>
                               <span>Podiums: {team.podiums}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-white leading-none tabular-nums">
                            <AnimatedCounter value={team.points} />
                          </div>
                          <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1">Total Pts</div>
                        </div>
                      </div>

                      {/* Points bar - Premium Style */}
                      <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        <motion.div
                          className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                          style={{ backgroundColor: getTeamColor(team.teamName) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${totalPoints > 0 ? (team.points / (filtered[0]?.points || 1)) * 100 : 0}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Desktop Hover Icon */}
                    <div className="hidden md:flex items-center px-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-f1-red"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
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
