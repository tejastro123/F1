import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { Card, Button, SectionHeader, Badge, SkeletonCard } from '../components/ui.jsx';
import { useNavigate } from 'react-router-dom';
import { FavoriteButton } from '../components/FavoriteButton.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function Favorites() {
  const { favorites, loading } = useFavorites();
  const navigate = useNavigate();

  const hasFavorites = useMemo(() => {
    return (
      favorites.drivers.length > 0 ||
      favorites.constructors.length > 0 ||
      favorites.races.length > 0
    );
  }, [favorites]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <SectionHeader title="MY COMMAND CENTER" subtitle="Your curated F1 intelligence" align="center" />
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Favorites — F1 2026 Command Center</title>
        <meta name="description" content="Your curated list of favorite drivers, teams, and races." />
      </Helmet>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <SectionHeader
          title="MY COMMAND CENTER"
          subtitle="Your personally curated watchlist and intelligence hub"
          align="center"
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <Card glass className="p-6 text-center border-white/5 rounded-[2.5rem]">
            <div className="text-4xl font-black text-f1-red mb-2">{favorites.drivers.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">DRIVERS</div>
          </Card>
          <Card glass className="p-6 text-center border-white/5 rounded-[2.5rem]">
            <div className="text-4xl font-black text-f1-gold mb-2">{favorites.constructors.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">TEAMS</div>
          </Card>
          <Card glass className="p-6 text-center border-white/5 rounded-[2.5rem]">
            <div className="text-4xl font-black text-white mb-2">{favorites.races.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">RACES</div>
          </Card>
        </div>

        {!hasFavorites ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="text-7xl mb-8 opacity-40">📡</div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
              NO SIGNAL LOCKED
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Your favorites list is empty. Start bookmarking drivers, constructors, and races to build your personalized command center.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/drivers')}
              className="!px-10 !py-4 text-xs uppercase tracking-[0.3em] font-bold"
            >
              EXPLORE THE GRID
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Favorited Drivers */}
            {favorites.drivers.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    <span className="text-f1-red">///</span> DRIVER INTEL
                  </h2>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {favorites.drivers.length} Active
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.drivers.map((driver, idx) => (
                    <motion.div
                      key={driver._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card !p-6 flex items-center justify-between border border-white/5"
                    >
                      <div
                        className="flex items-center gap-6 cursor-pointer"
                        onClick={() => navigate(`/drivers/${driver._id}`)}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-f1-red to-f1-red/50 flex items-center justify-center text-white font-black text-lg italic">
                          {driver.rank || '?'}
                        </div>
                        <div>
                          <div className="font-black text-white uppercase italic tracking-tighter text-xl group-hover:text-f1-red transition-colors">
                            {driver.fullName}
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: getTeamColor(driver.team) }}>
                            {driver.team}
                          </div>
                        </div>
                      </div>
                      <FavoriteButton type="drivers" id={driver._id} size="md" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Favorited Constructors */}
            {favorites.constructors.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    <span className="text-f1-gold">///</span> CONSTRUCTOR INTEL
                  </h2>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {favorites.constructors.length} Active
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.constructors.map((team, idx) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card !p-6 flex items-center justify-between border border-white/5"
                    >
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => navigate(`/constructors/${team._id}`)}
                      >
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt="" className="w-14 h-14 object-contain" />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: getTeamColor(team.name) + '20', color: getTeamColor(team.name) }}
                          >
                            {team.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-black text-white uppercase tracking-tighter">
                            {team.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {team.nationality}
                          </div>
                        </div>
                      </div>
                      <FavoriteButton type="constructors" id={team._id} size="md" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Favorited Races */}
            {favorites.races.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    <span className="text-blue-400">///</span> MISSION SCHEDULE
                  </h2>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {favorites.races.length} Upcoming
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.races.map((race, idx) => (
                    <motion.div
                      key={race._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card !p-6 border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl">{race.flag}</span>
                        <FavoriteButton type="races" id={race._id} size="sm" />
                      </div>
                      <h3 className="text-xl font-black uppercase italic mb-2 leading-tight">
                        {race.grandPrixName}
                      </h3>
                      <div className="space-y-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <p>{race.venue}</p>
                        <p>
                          Round {race.round} •{' '}
                          {new Date(race.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
