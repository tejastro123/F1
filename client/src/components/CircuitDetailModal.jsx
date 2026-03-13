import { motion, AnimatePresence } from 'framer-motion';
import { Card, SectionHeader, StatPill, Button } from './ui.jsx';
import CircuitImage from './CircuitImage.jsx';

export default function CircuitDetailModal({ isOpen, onClose, race }) {
  if (!race) return null;

  const { circuitDetails, grandPrixName, venue, date, flag } = race;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-f1-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <span>{flag}</span> {grandPrixName}
                </h2>
                <p className="text-gray-400 mt-1">{venue} · {new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
              <Button variant="ghost" onClick={onClose} className="text-2xl hover:text-f1-red">✕</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Map & Specs */}
                <div className="space-y-6">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-f1-dark ring-1 ring-white/5 shadow-inner">
                    <CircuitImage trackData={race} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <StatPill label="Track Length" value={circuitDetails?.length || 'N/A'} icon="📏" />
                    <StatPill label="Total Turns" value={circuitDetails?.turns || 0} icon="🏎️" />
                  </div>

                  {circuitDetails?.lapRecord?.time && (
                    <Card className="bg-f1-red/5 border-f1-red/20">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">⏱️</div>
                        <div>
                          <p className="text-xs text-f1-red font-bold uppercase tracking-widest">Lap Record</p>
                          <p className="text-2xl font-black text-white">{circuitDetails.lapRecord.time}</p>
                          <p className="text-sm text-gray-400">
                            {circuitDetails.lapRecord.driver} ({circuitDetails.lapRecord.year})
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Right: History & Description */}
                <div className="space-y-8">
                  <section>
                    <SectionHeader title="About the Track" subtitle="Technical Overview" />
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {circuitDetails?.description || 'No description available for this circuit yet.'}
                    </p>
                  </section>

                  <section className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <SectionHeader title="Weekend Schedule" subtitle="Session Timings (Local Time)" />
                    <div className="space-y-3">
                      {race.sessions ? (
                        Object.entries(race.sessions)
                          .filter(([_, time]) => time) // Only show sessions with times
                          .map(([key, time]) => {
                            const labels = {
                              fp1: 'Practice 1',
                              fp2: 'Practice 2',
                              fp3: 'Practice 3',
                              qualifying: 'Qualifying',
                              sprintQualifying: 'Sprint Shootout',
                              sprintRace: 'Sprint Race',
                              race: 'Grand Prix'
                            };
                            const isMainRace = key === 'race';
                            const isQualy = key.includes('Qualifying');
                            
                            return (
                              <div key={key} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isMainRace ? 'bg-f1-red/10 border-f1-red/30' : 'bg-white/5 border-white/5'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    isMainRace ? 'bg-f1-red animate-pulse' : 
                                    isQualy ? 'bg-f1-gold' : 'bg-gray-500'
                                  }`} />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{labels[key] || key}</span>
                                </div>
                                <span className={`text-[10px] font-black tabular-nums transition-colors ${isMainRace ? 'text-f1-red' : 'text-gray-400'}`}>
                                  {time}
                                </span>
                              </div>
                            );
                          })
                      ) : (
                        <div className="text-center py-4 opacity-30 italic text-[10px] font-black uppercase tracking-widest">
                          Schedule pending FIA confirmation
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <SectionHeader title="Rich History" subtitle="Moments & Milestones" />
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-400 leading-relaxed italic border-l-2 border-f1-red pl-4">
                        {circuitDetails?.history || 'History documentation pending final verification.'}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>Close Detail</Button>
              <Button variant="gold" onClick={() => window.open(`https://www.formula1.com/en/racing/2026/${grandPrixName.replace(/ /g, '_')}.html`, '_blank')}>
                Official Ticket Info
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
