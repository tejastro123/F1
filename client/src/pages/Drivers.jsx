import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useDrivers } from '../hooks/useData.js';
import { AnimatedCounter, Badge, SectionHeader, TeamColorStripe, SkeletonLoader } from '../components/ui.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function Drivers() {
  const { drivers, loading } = useDrivers();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const navigate = useNavigate();

  const teams = useMemo(() => [...new Set(drivers.map(d => d.team))].sort(), [drivers]);
  const maxPoints = useMemo(() => Math.max(...drivers.map(d => d.points), 1), [drivers]);

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.fullName.toLowerCase().includes(search.toLowerCase()) ||
                           d.team.toLowerCase().includes(search.toLowerCase()) ||
                           d.nationality.toLowerCase().includes(search.toLowerCase());
      const matchesTeam = !teamFilter || d.team === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [drivers, search, teamFilter]);

  return (
    <>
      <Helmet>
        <title>Driver Standings — F1 2026</title>
        <meta name="description" content="2026 Formula 1 Driver Championship standings" />
      </Helmet>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title="THE GRID" subtitle="Official 2026 World Driver Championship Standings" />

        {/* Filters - Command Center Style */}
        <Card glass className="flex flex-col md:flex-row gap-4 mb-12 rounded-3xl p-4 md:p-6 border-white/10">
          <div className="relative flex-1 group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-f1-red transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              type="text"
              placeholder="Search the grid..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-f1-red/30 focus:bg-white/10 transition-all font-bold"
            />
          </div>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-3.5 text-sm font-black text-white uppercase tracking-widest focus:outline-none focus:border-f1-red/30 transition-all cursor-pointer"
          >
            <option value="" className="bg-f1-dark">All Constructors</option>
            {teams.map(t => <option key={t} value={t} className="bg-f1-dark">{t}</option>)}
          </select>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Desktop View - Retained but refined */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4 px-2">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="py-4 px-6 text-left">Pos</th>
                    <th className="py-4 px-6 text-left">Driver</th>
                    <th className="py-4 px-6 text-left">Constructor</th>
                    <th className="py-4 px-6 text-right">Points</th>
                    <th className="py-4 px-6 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {filtered.map((driver, idx) => (
                    <motion.tr
                      key={driver._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/drivers/${driver._id}`)}
                    >
                      <td className="bg-white/5 rounded-l-[1.5rem] border-y border-l border-white/5 py-5 px-6">
                        <div className="flex items-center gap-4">
                          <TeamColorStripe team={driver.team} className="h-10 w-1.5" />
                          <span className={`text-2xl font-black italic ${idx === 0 ? 'text-f1-gold' : 'text-white/80'}`}>{driver.rank}</span>
                        </div>
                      </td>
                      <td className="bg-white/5 border-y border-white/5 py-5 px-6">
                        <div className="flex items-center gap-4">
                          {driver.photoUrl ? (
                            <img src={driver.photoUrl} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shadow-lg" alt="" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-xl">👤</div>
                          )}
                          <div>
                            <div className="font-black text-white uppercase italic tracking-tighter text-lg leading-none">{driver.fullName}</div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">#{driver.driverNumber || '??'} · {driver.nationality}</div>
                          </div>
                        </div>
                      </td>
                      <td className="bg-white/5 border-y border-white/5 py-5 px-6">
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: getTeamColor(driver.team) }}>{driver.team}</span>
                      </td>
                      <td className="bg-white/5 border-y border-white/5 py-5 px-6 text-right">
                        <span className="text-2xl font-black tabular-nums text-white"><AnimatedCounter value={driver.points} /></span>
                      </td>
                      <td className="bg-white/5 rounded-r-[1.5rem] border-y border-r border-white/5 py-5 px-6 min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                            <span>Wins: {driver.wins}</span>
                            <span>Podiums: {driver.podiums}</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(driver.points / maxPoints) * 100}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: getTeamColor(driver.team) }}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card Grid */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((driver, idx) => (
                <motion.div
                  key={driver._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/drivers/${driver._id}`)}
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center gap-6 relative overflow-hidden group active:scale-[0.98] transition-all"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-2" style={{ backgroundColor: getTeamColor(driver.team) }} />
                  
                  <div className="flex flex-col items-center justify-center min-w-[40px]">
                    <span className={`text-3xl font-black italic ${idx === 0 ? 'text-f1-gold' : 'text-white/40'}`}>{driver.rank}</span>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] -mt-1">POS</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white uppercase italic tracking-tighter text-xl leading-none truncate group-hover:text-f1-red transition-colors">
                      {driver.fullName}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                       <span style={{ color: getTeamColor(driver.team) }}>{driver.team}</span>
                       <span className="w-1 h-1 bg-white/20 rounded-full" />
                       <span className="text-gray-500">#{driver.driverNumber || '??'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black tabular-nums text-white leading-none">{driver.points}</div>
                    <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">POINTS</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
