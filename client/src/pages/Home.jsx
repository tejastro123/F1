import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStats, useRaces } from '../hooks/useData.js';
import useCountdown from '../hooks/useCountdown.js';
import { AnimatedCounter, Card, Button, StatPill, SectionHeader, SkeletonCard } from '../components/ui.jsx';

export default function Home() {
  const { stats, loading: statsLoading } = useStats();
  const { races, loading: racesLoading } = useRaces();
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleBadgeClick = () => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      navigate('/admin/login');
      return;
    }
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 500);
  };

  const nextRace = races.find(r => r.status === 'upcoming');
  const latestRace = [...races].reverse().find(r => r.status === 'completed');
  const countdown = useCountdown(nextRace?.date);

  return (
    <>
      <Helmet>
        <title>F1 2026 Season Tracker</title>
        <meta name="description" content="Track the 2026 Formula 1 season — live standings, race calendar, predictions and analytics" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-f1-red/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-f1-red/5 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-f1-red/50 to-transparent" />
        </div>

        {/* Animated diagonal stripes */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-white/20"
              style={{ top: `${12 + i * 12}%`, left: '-10%', right: '-10%', transform: `rotate(-3deg)` }}
              animate={{ x: ['-5%', '5%'] }}
              transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', delay: i * 0.3 }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 bg-f1-red/10 border border-f1-red/20 rounded-full px-4 py-1.5 mb-6 cursor-default select-none"
              onClick={handleBadgeClick}
            >
              <span className="w-2 h-2 bg-f1-red rounded-full animate-live-pulse" />
              <span className="text-f1-red text-sm font-medium">2026 SEASON</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight"
          >
            FORMULA <span className="text-f1-red">1</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 font-light mb-10"
          >
            Season Tracker · Live Standings · Race Calendar
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/drivers">
              <Button variant="primary" size="lg">Driver Standings</Button>
            </Link>
            <Link to="/constructors">
              <Button variant="secondary" size="lg">Constructors</Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Ticker */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Season at a Glance" subtitle="Key statistics from the 2026 championship" />

          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatPill icon="🏆" label="Championship Leader" value={stats.leaderName} />
              <StatPill icon="⭐" label="Leader Points" value={stats.leaderPoints} />
              <StatPill icon="🏁" label="Races Completed" value={stats.racesDone} />
              <StatPill icon="📅" label="Races Remaining" value={stats.racesRemaining} />
            </div>
          )}
        </div>
      </section>

      {/* Next Race Countdown */}
      {nextRace && (
        <section className="py-16 px-4 bg-f1-panel/50">
          <div className="max-w-7xl mx-auto text-center">
            <SectionHeader title="Next Race" subtitle={`${nextRace.flag} ${nextRace.grandPrixName} · ${nextRace.venue}`} />
            
            <div className="flex justify-center gap-4 md:gap-6">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds },
              ].map((unit) => (
                <motion.div
                  key={unit.label}
                  className="bg-f1-card rounded-xl border border-white/10 p-4 md:p-6 min-w-[80px] md:min-w-[100px]"
                  initial={{ rotateX: -90 }}
                  animate={{ rotateX: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="text-3xl md:text-5xl font-black text-white tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1 uppercase tracking-wider">{unit.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Race Result */}
      {latestRace && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Latest Result" subtitle={`Round ${latestRace.round} · ${latestRace.grandPrixName}`} />
            <Card className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <span className="text-4xl">{latestRace.flag}</span>
                <h3 className="text-xl font-bold mt-2">{latestRace.grandPrixName}</h3>
                <p className="text-gray-400">{latestRace.venue}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { pos: 'P2', name: latestRace.p2, color: 'text-f1-silver' },
                  { pos: 'P1', name: latestRace.p1Winner, color: 'text-f1-gold' },
                  { pos: 'P3', name: latestRace.p3, color: 'text-f1-bronze' },
                ].map((p) => (
                  <div key={p.pos} className={`text-center ${p.pos === 'P1' ? '-mt-4' : 'mt-4'}`}>
                    <div className={`text-3xl font-black ${p.color}`}>{p.pos}</div>
                    <div className="text-sm font-medium mt-1">{p.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Onboarding Section */}
      <section className="py-20 px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="How it Works" subtitle="Master the 11 prediction categories and climb the leaderboard" />
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="w-12 h-12 bg-f1-red/10 rounded-xl flex items-center justify-center text-2xl">✍️</div>
              <h3 className="text-xl font-bold text-white">1. Secure Your Entry</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Log in via Google or Discord to start your campaign. Your predictions are securely tied to your profile across all devices.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 bg-f1-gold/10 rounded-xl flex items-center justify-center text-2xl">🔮</div>
              <h3 className="text-xl font-bold text-white">2. Make Your Calls</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Predict winners, poles, and surprises for every race. From <span className="text-f1-red font-bold">BIG FLOP</span> to the legendary <span className="text-f1-gold font-bold">CRAZY</span> call.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-2xl">🏅</div>
              <h3 className="text-xl font-bold text-white">3. Climb the Ranks</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Admins score races live. Track your accuracy on the community leaderboard and prove you're the ultimate F1 strategist.
              </p>
            </motion.div>
          </div>

          <div className="mt-16 bg-f1-card/30 border border-white/5 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">The 11 Categories</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'GPRIX WIN', 'GPRIX POLE', 'TOP1', 'TOP2', 'TOP3', 
                'SPRINT WIN', 'SPRINT POLE', 'GOOD SURPRISE', 'BIG FLOP', 
                'PWHAT?', 'CRAZY'
              ].map(cat => (
                <span key={cat} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-f1-gold uppercase tracking-widest hover:border-f1-gold/50 transition-colors">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
