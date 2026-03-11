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

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Driver Standings" subtitle="2026 Formula 1 Championship" />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search drivers, teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-f1-card border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-f1-red/50 flex-1"
            aria-label="Search drivers"
          />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-f1-card border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-f1-red/50"
            aria-label="Filter by team"
          >
            <option value="">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <SkeletonLoader lines={10} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="text-left py-3 px-4 w-12">Pos</th>
                    <th className="text-left py-3 px-4">Driver</th>
                    <th className="text-left py-3 px-4">Team</th>
                    <th className="text-left py-3 px-4">Nat</th>
                    <th className="text-right py-3 px-4">Points</th>
                    <th className="text-right py-3 px-4">Wins</th>
                    <th className="text-right py-3 px-4">Podiums</th>
                    <th className="py-3 px-4 w-48">Points Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((driver, idx) => (
                    <motion.tr
                      key={driver._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => navigate(`/drivers/${driver._id}`)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                      role="row"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <TeamColorStripe team={driver.team} className="h-8" />
                          <span className={`font-bold text-lg ${idx === 0 ? 'text-f1-gold' : idx === 1 ? 'text-f1-silver' : idx === 2 ? 'text-f1-bronze' : 'text-white'}`}>
                            {driver.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-white group-hover:text-f1-red transition-colors">
                          {driver.fullName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm" style={{ color: getTeamColor(driver.team) }}>
                          {driver.team}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{driver.nationality}</td>
                      <td className="py-4 px-4 text-right font-bold text-lg">
                        <AnimatedCounter value={driver.points} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        {driver.wins > 0 && <Badge color="gold">{driver.wins}</Badge>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-400">{driver.podiums}</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-f1-dark rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: getTeamColor(driver.team) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(driver.points / maxPoints) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.05 }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card grid */}
            <div className="md:hidden grid gap-3">
              {filtered.map((driver, idx) => (
                <motion.div
                  key={driver._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => navigate(`/drivers/${driver._id}`)}
                  className="bg-f1-card rounded-xl border border-white/5 p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2 min-w-[40px]">
                    <TeamColorStripe team={driver.team} className="h-10" />
                    <span className={`font-black text-xl ${idx === 0 ? 'text-f1-gold' : 'text-white'}`}>{driver.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{driver.fullName}</div>
                    <div className="text-sm" style={{ color: getTeamColor(driver.team) }}>{driver.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{driver.points}</div>
                    <div className="text-xs text-gray-400">PTS</div>
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
