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
      </Helmet>      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[150%] h-[150%] bg-f1-red/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-f1-red/10 rounded-full blur-[120px]" />
          
          {/* Cinematic Light Streaks */}
          <motion.div 
            animate={{ 
              x: [-500, 1500],
              opacity: [0, 0.3, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] left-0 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-f1-red to-transparent -rotate-12 blur-sm"
          />
          <motion.div 
            animate={{ 
              x: [1500, -500],
              opacity: [0, 0.2, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute top-[60%] left-0 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 blur-sm"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-full px-6 py-2.5 mb-10 cursor-pointer select-none hover:bg-white/10 hover:border-f1-red/30 transition-all active:scale-95 group shadow-2xl"
              onClick={handleBadgeClick}
            >
              <div className="relative">
                <span className="block w-2.5 h-2.5 bg-f1-red rounded-full animate-live-pulse" />
                <span className="absolute inset-0 bg-f1-red rounded-full animate-ping opacity-50" />
              </div>
              <span className="text-white text-[11px] font-black tracking-[0.4em] uppercase">Season 2026 Archive</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-[12rem] font-black text-white mb-8 tracking-tighter uppercase italic leading-[0.75] perspective-1000"
          >
            FORMULA <span className="text-f1-red drop-shadow-[0_0_50px_rgba(225,6,0,0.4)]">1</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-3xl text-gray-400 font-medium mb-16 max-w-3xl mx-auto leading-tight italic tracking-tight"
          >
            The premium "Second-Screen" cockpit for the <span className="text-white">2026 Grand Prix</span> era.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center gap-6 px-4"
          >
            <Link to="/drivers" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full h-16 !px-12 text-lg shadow-[0_20px_50px_rgba(225,6,0,0.3)]">
                Live Standings
              </Button>
            </Link>
            <Link to="/live" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-16 !px-12 text-lg backdrop-blur-3xl hover:bg-white/5">
                Command Center
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator - Hidden on very small screens to save space */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
          animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-f1-red rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Ticker */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Telemetry" subtitle="Instant insights from the ongoing championship fight" align="center" />

          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatPill icon="🏁" label="Championship P1" value={stats.leaderName} />
              <StatPill icon="⚡" label="Total Pts" value={stats.leaderPoints} />
              <StatPill icon="🏆" label="Race Wins" value={stats.racesDone} />
              <StatPill icon="🚦" label="To Go" value={stats.racesRemaining} />
            </div>
          )}
        </div>
      </section>

      {/* Next Race Countdown */}
      {nextRace && (
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <SectionHeader title="NEXT LIGHTS OUT" subtitle={`${nextRace.flag} ${nextRace.grandPrixName} · ${nextRace.venue}`} align="center" />
            
            <div className="grid grid-cols-2 md:flex md:justify-center gap-4 md:gap-8 mt-12 px-2">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Mins', value: countdown.minutes },
                { label: 'Secs', value: countdown.seconds },
              ].map((unit, idx) => (
                <motion.div
                  key={unit.label}
                  className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 p-6 md:p-10 min-w-[120px] md:min-w-[160px] flex flex-col items-center justify-center shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="text-4xl md:text-7xl font-black text-white tabular-nums tracking-tighter leading-none mb-2">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] md:text-sm text-f1-red font-black uppercase tracking-[0.2em]">{unit.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Race Result - Refined */}
      {latestRace && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="LATEST BATTLE" subtitle={`Round ${latestRace.round} · Results from the grid`} align="center" />
            <Card glass className="max-w-4xl mx-auto rounded-[3rem] p-8 md:p-16 relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <span className="text-9xl font-black italic">#{latestRace.round}</span>
              </div>
              
              <div className="text-center mb-16 px-4">
                <span className="text-6xl md:text-8xl drop-shadow-2xl">{latestRace.flag}</span>
                <h3 className="text-3xl md:text-5xl font-black mt-6 uppercase italic tracking-tighter leading-none">{latestRace.grandPrixName}</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest mt-2">{latestRace.venue}</p>
              </div>

              <div className="grid grid-cols-3 md:gap-12 items-end">
                {[
                  { pos: 'P2', name: latestRace.p2, color: 'text-f1-silver', h: 'h-32 md:h-48' },
                  { pos: 'P1', name: latestRace.p1Winner, color: 'text-f1-gold', h: 'h-40 md:h-64' },
                  { pos: 'P3', name: latestRace.p3, color: 'text-f1-bronze', h: 'h-24 md:h-36' },
                ].map((p) => (
                  <div key={p.pos} className="text-center space-y-4">
                    <div className="font-black text-white/50 text-[10px] uppercase tracking-widest">{p.pos}</div>
                    <div className={`w-full bg-white/5 rounded-t-[2rem] border-x border-t border-white/5 relative flex items-center justify-center overflow-hidden ${p.h}`}>
                      <div className={`text-3xl md:text-6xl font-black ${p.color} z-10 italic`}>{p.pos}</div>
                      {p.pos === 'P1' && <div className="absolute inset-0 bg-f1-gold/5 blur-3xl" />}
                    </div>
                    <div className="text-xs md:text-lg font-black uppercase tracking-tight text-white leading-none px-1">
                      {p.name.split(' ').pop()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* How it Works - Deep Refresh */}
      <section className="py-24 px-6 mb-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="THE PLAYBOOK" subtitle="Master the prediction system and dominate the rankings" />
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: '🔑', 
                title: 'AUTHENTICATE', 
                text: 'Join via Discord/Google to claim your pit lane entry. Your progress is synced globally across the secure edge network.'
              },
              { 
                icon: '🔮', 
                title: 'PREDICT', 
                text: 'From the main winner to the legendary "CRAZY" call. Balance your strategy across 11 high-stakes categories.'
              },
              { 
                icon: '🏆', 
                title: 'CONQUER', 
                text: 'Climb the podium of the live leaderboard. Admins score every overtake and twist in real-time.'
              }
            ].map((step, idx) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="space-y-6 group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-3xl shadow-xl group-hover:bg-f1-red/10 group-hover:border-f1-red/20 transition-all">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tighter italic">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>

          <Card glass className="mt-20 rounded-[3rem] p-10 md:p-16 border-f1-gold/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-f1-gold/10 rounded-full blur-[60px]" />
            <h3 className="text-2xl md:text-3xl font-black text-white mb-10 uppercase italic tracking-tighter text-center">ACTIVE CATEGORIES</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'GP WINNER', 'POLE POSITION', 'PODIUM LOCK', 'FASTEST LAP', 
                'SPRINT KING', 'MIDFIELD HERO', 'SURPRISE GAIN', 'THE BIG FLOP', 
                'PIT ERROR', 'SAFETY CAR', 'THE CRAZY CALL'
              ].map(cat => (
                <span key={cat} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-f1-gold uppercase tracking-[0.2em] hover:bg-f1-gold hover:text-black transition-all cursor-default select-none shadow-lg">
                  {cat}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
