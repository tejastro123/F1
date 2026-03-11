import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useRaces } from '../hooks/useData.js';
import useCountdown from '../hooks/useCountdown.js';
import { Card, Badge, RaceStatusBadge, SectionHeader, SkeletonCard } from '../components/ui.jsx';
import { formatDate } from '../utils/formatDate.js';

function RaceCountdown({ dateStr }) {
  const countdown = useCountdown(dateStr);
  if (countdown.expired) return null;
  return (
    <div className="flex gap-2 mt-3">
      {['days', 'hours', 'minutes'].map((unit) => (
        <div key={unit} className="bg-f1-dark/50 rounded-lg px-2 py-1 text-center min-w-[50px]">
          <div className="text-sm font-bold text-white">{countdown[unit]}</div>
          <div className="text-[10px] text-gray-500 uppercase">{unit.slice(0, 3)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Calendar() {
  const { races, loading } = useRaces();

  const completed = races.filter(r => r.status === 'completed');
  const upcoming = races.filter(r => r.status === 'upcoming');

  return (
    <>
      <Helmet>
        <title>Race Calendar — F1 2026</title>
        <meta name="description" content="2026 Formula 1 Race Calendar — 24 Grands Prix" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader
          title="Race Calendar"
          subtitle={`${completed.length} of ${races.length} races completed · ${upcoming.length} remaining`}
        />

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map((race, idx) => (
              <motion.div
                key={race._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className={`bg-f1-card rounded-xl border overflow-hidden ${
                  race.status === 'completed' ? 'border-white/5' : 'border-white/10'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 bg-f1-dark px-2 py-1 rounded">R{race.round}</span>
                      <span className="text-2xl">{race.flag}</span>
                    </div>
                    <RaceStatusBadge status={race.status} />
                  </div>

                  <h3 className="font-bold text-white text-lg mb-1">{race.grandPrixName}</h3>
                  <p className="text-sm text-gray-400">{race.venue}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(race.date)}</p>

                  {/* Podium for completed races */}
                  {race.status === 'completed' && race.p1Winner && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-f1-gold text-xs font-bold w-6">P1</span>
                        <span className="text-sm font-medium text-white">{race.p1Winner}</span>
                      </div>
                      {race.p2 && (
                        <div className="flex items-center gap-2">
                          <span className="text-f1-silver text-xs font-bold w-6">P2</span>
                          <span className="text-sm text-gray-300">{race.p2}</span>
                        </div>
                      )}
                      {race.p3 && (
                        <div className="flex items-center gap-2">
                          <span className="text-f1-bronze text-xs font-bold w-6">P3</span>
                          <span className="text-sm text-gray-300">{race.p3}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Countdown for upcoming races */}
                  {race.status === 'upcoming' && <RaceCountdown dateStr={race.date} />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
