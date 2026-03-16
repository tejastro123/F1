import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useRaces } from '../hooks/useData.jsx';
import useCountdown from '../hooks/useCountdown.js';
import { Card, Badge, RaceStatusBadge, SectionHeader, SkeletonCard, Button } from '../components/ui.jsx';
import PredictionModal from '../components/PredictionModal.jsx';
import CircuitImage from '../components/CircuitImage.jsx';
import CircuitDetailModal from '../components/CircuitDetailModal.jsx';
import { formatDate } from '../utils/formatDate.js';

function RaceCountdown({ dateStr }) {
  const countdown = useCountdown(dateStr);
  if (countdown.expired) return null;
  return (
    <div className="flex gap-2 mt-4">
      {['days', 'hours', 'minutes'].map((unit) => (
        <div key={unit} className="bg-white/5 backdrop-blur-md rounded-xl px-3 py-2 text-center min-w-[65px] border border-white/5 shadow-lg">
          <div className="text-lg font-black text-white leading-none">{countdown[unit]}</div>
          <div className="text-[8px] font-black text-f1-red uppercase tracking-widest mt-1">{unit.slice(0, 3)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Calendar() {
  const { races, loading } = useRaces();
  const [selectedRace, setSelectedRace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCircuitModalOpen, setIsCircuitModalOpen] = useState(false);

  const completed = races.filter(r => r.status === 'completed');
  const upcoming = races.filter(r => r.status === 'upcoming');

  return (
    <>
      <Helmet>
        <title>2026 CALENDAR — F1 TRACKER</title>
        <meta name="description" content="2026 Formula 1 Race Calendar — 24 Grands Prix" />
      </Helmet>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader
          title="Season Timeline"
          subtitle={`${completed.length} races in the books · ${upcoming.length} rounds of glory remaining`}
        />

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Immersive Circuit Preview Area */}
            {selectedRace && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12 w-full aspect-video md:aspect-[21/9] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] border border-white/10 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                <CircuitImage trackData={selectedRace} />
                <div className="absolute bottom-10 left-10 z-20">
                  <Badge color="red" className="mb-4">CIRCUIT INFO</Badge>
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{selectedRace.venue}</h2>
                </div>
              </motion.div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {races.map((race, idx) => (
              <motion.div
                key={race._id}
                onClick={() => {
                  setSelectedRace(race);
                  setIsCircuitModalOpen(true);
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative cursor-pointer active:scale-[0.98] transition-all rounded-[2.5rem] border overflow-hidden p-8 shadow-2xl ${
                  race.status === 'completed' 
                    ? 'bg-white/[0.02] border-white/5 opacity-80 hover:opacity-100 hover:bg-white/[0.05]' 
                    : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.1] hover:border-white/20'
                } ${selectedRace?._id === race._id ? 'ring-2 ring-f1-red/50 bg-white/[0.08]' : ''}`}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-white/40 bg-white/5 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-white/5 shadow-inner">RND {String(race.round).padStart(2, '0')}</span>
                      <span className="text-4xl drop-shadow-lg">{race.flag}</span>
                    </div>
                    <RaceStatusBadge status={race.status} className="scale-110 !px-4 !py-1.5" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter leading-none mb-2 group-hover:text-f1-red transition-colors">{race.grandPrixName}</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{race.venue}</p>
                    <p className="text-[10px] font-black text-f1-red uppercase tracking-[0.2em] mt-3">🚦 {formatDate(race.date)}</p>
                  </div>

                  {/* Results for completed races */}
                  {race.status === 'completed' && race.p1Winner && (
                    <div className="mt-8 grid grid-cols-3 gap-2">
                       {[
                         { pos: 'P1', name: race.p1Winner, color: 'text-f1-gold' },
                         { pos: 'P2', name: race.p2, color: 'text-f1-silver' },
                         { pos: 'P3', name: race.p3, color: 'text-f1-bronze' }
                       ].map(p => (
                         <div key={p.pos} className="text-center p-2 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className={`text-[10px] font-black ${p.color}`}>{p.pos}</div>
                            <div className="text-[8px] font-black text-white uppercase truncate">{p.name?.split(' ').pop()}</div>
                         </div>
                       ))}
                    </div>
                  )}

                  {/* Interaction for upcoming races */}
                  {race.status === 'upcoming' && (
                    <div className="mt-8 space-y-4">
                      <RaceCountdown dateStr={race.date} />
                      <Button 
                        variant="primary" 
                        size="md" 
                        className="w-full !rounded-2xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRace(race);
                          setIsModalOpen(true);
                        }}
                      >
                        LOCK PREDICTIONS
                      </Button>
                    </div>
                  )}
                </div>

                {/* Aesthetic Background Accents */}
                <div className="absolute -bottom-10 -right-10 text-9xl font-black italic text-white/[0.02] pointer-events-none group-hover:text-white/[0.05] transition-colors">
                  {String(race.round).padStart(2, '0')}
                </div>
              </motion.div>
            ))}
          </div>
          </>
        )}
      </div>

      <PredictionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        race={selectedRace}
        initialCategory="GP_WINNER"
        onPredicted={() => {}}
      />
      <CircuitDetailModal 
        isOpen={isCircuitModalOpen}
        onClose={() => setIsCircuitModalOpen(false)}
        race={selectedRace}
      />
    </>
  );
}
