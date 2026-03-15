import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStats, useRaces, useNews } from '../hooks/useData.js';
import useCountdown from '../hooks/useCountdown.js';
import { AnimatedCounter, Card, Button, StatPill, SectionHeader, SkeletonCard } from '../components/ui.jsx';

export default function Home() {
  const { stats, loading: statsLoading } = useStats();
  const { races, loading: racesLoading } = useRaces();
  const { news, loading: newsLoading } = useNews();
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32">
        {/* Professional Technical Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(225,6,0,0.08),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-f1-dark to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/10 rounded-full px-5 py-2 backdrop-blur-3xl shadow-sm group hover:border-f1-red/30 transition-all cursor-crosshair">
              <span className="w-1.5 h-1.5 bg-f1-red rounded-full animate-pulse shadow-[0_0_8px_rgba(212,0,0,0.8)]" />
              <span className="text-[10px] font-bold text-white tracking-[0.4em] uppercase">System Status: Optimal</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest pl-2 border-l border-white/10 uppercase italic">v2026.4.0</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-[8rem] font-bold text-white mb-6 tracking-tight uppercase leading-[0.85] italic">
              COMMAND <span className="text-f1-red">CENTER</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 font-medium mb-16 max-w-3xl mx-auto leading-relaxed border-y border-white/5 py-6 uppercase tracking-[0.2em]"
          >
            The technical benchmark for <span className="text-white">Professional Formula 1</span> telemetry and predictions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 px-4"
          >
            <Link to="/drivers" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full h-14 !px-10 text-xs uppercase tracking-[0.3em] font-bold">
                Deploy Standings
              </Button>
            </Link>
            <Link to="/live" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-14 !px-10 text-xs uppercase tracking-[0.3em] font-bold border-white/10 hover:bg-white/5">
                Terminal Access
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Technical Coordinate Indicators */}
        <div className="absolute bottom-12 left-12 hidden lg:flex flex-col gap-1 opacity-20 text-[10px] font-mono uppercase tracking-widest italic">
          <span>Lat: 51.5074° N</span>
          <span>Lng: 0.1278° W</span>
        </div>
        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col gap-1 opacity-20 text-[10px] font-mono uppercase tracking-widest text-right italic">
          <span>Signal: Encrypted</span>
          <span>Refresh: 120Hz</span>
        </div>
      </section>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block pointer-events-none"
        animate={{ y: [0, 10, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="w-5 h-8 border border-white/10 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-f1-red rounded-full" />
        </div>
      </motion.div>

      {/* Stats Ticker - Professional Bento Style */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="System Telemetry" subtitle="Active championship data streams" align="center" />

          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatPill icon="🏁" label="P1 CHASSIS" value={stats.leaderName} />
              <StatPill icon="⚡" label="SIGNAL PTS" value={stats.leaderPoints} />
              <StatPill icon="🏆" label="COMPLETED" value={stats.racesDone} />
              <StatPill icon="🚦" label="REMAINING" value={stats.racesRemaining} />
            </div>
          )}
        </div>
      </section>

      {/* Next Race Countdown - Machined Precision */}
      {nextRace && (
        <section className="py-32 px-6 relative overflow-hidden bg-white/[0.01] border-y border-white/5">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <SectionHeader title="Next Mission" subtitle={`${nextRace.flag} ${nextRace.grandPrixName} · ${nextRace.venue}`} align="center" />
            
            <div className="grid grid-cols-2 lg:flex lg:justify-center gap-4 md:gap-6 mt-16 px-2">
              {[
                { label: 'DAYS', value: countdown.days },
                { label: 'HOURS', value: countdown.hours },
                { label: 'MINUTES', value: countdown.minutes },
                { label: 'SECONDS', value: countdown.seconds },
              ].map((unit, idx) => (
                <Card
                  key={unit.label}
                  className="!p-8 min-w-[140px] md:min-w-[180px] flex flex-col items-center justify-center border-white/5"
                  hover={true}
                  glass={true}
                >
                  <div className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter leading-none mb-3">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-f1-red font-bold uppercase tracking-[0.3em]">{unit.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Race Result - Technical Ledger */}
      {latestRace && (
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Event Archive" subtitle={`Round ${latestRace.round} · Mission Data Recorded`} align="center" />
            <Card className="max-w-6xl mx-auto !p-0 overflow-hidden" glass={true}>
              <div className="grid md:grid-cols-2">
                <div className="p-12 md:p-20 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.01]">
                  <span className="text-8xl md:text-9xl mb-8 drop-shadow-2xl">{latestRace.flag}</span>
                  <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4 italic leading-tight">{latestRace.grandPrixName}</h3>
                  <div className="flex items-center gap-4 text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                    <span className="w-1.5 h-1.5 bg-f1-red rounded-full" />
                    {latestRace.venue}
                  </div>
                </div>
                
                <div className="p-12 md:p-20 flex flex-col justify-center gap-10">
                  {[
                    { pos: 'P1', name: latestRace.p1Winner, color: 'text-f1-gold' },
                    { pos: 'P2', name: latestRace.p2, color: 'text-f1-silver' },
                    { pos: 'P3', name: latestRace.p3, color: 'text-f1-bronze' },
                  ].map((p, idx) => (
                    <motion.div 
                      key={p.pos}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-8">
                        <span className={`text-3xl font-bold italic ${p.color}`}>{p.pos}</span>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Driver Entry</span>
                          <span className="text-xl font-bold uppercase tracking-wide">{p.name}</span>
                        </div>
                      </div>
                      <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-current ${p.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 1.2, delay: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Latest Intelligence - News Feed */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Latest Intelligence" subtitle="Real-time F1 operations and updates" align="center" />
          
          {newsLoading ? (
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {news.map((item, idx) => (
                <motion.a
                  key={item._id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <Card className="h-full border-white/5 transition-colors group-hover:border-f1-red/30 overflow-hidden !p-0" glass={true}>
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=1000'} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-f1-red text-[10px] font-bold text-white uppercase tracking-widest rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold text-f1-red uppercase tracking-widest">{item.source}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-4 group-hover:text-f1-red transition-colors italic uppercase leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  </Card>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Playbook - Engineering Specs */}
      <section className="py-32 px-6 mb-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Operation Playbook" subtitle="Tactical protocols for high-stakes competition" />
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: '01', 
                title: 'AUTHENTICATION', 
                text: 'Join the edge network via Discord or Google. All telemetry and results are synchronized across the global command cluster.'
              },
              { 
                icon: '02', 
                title: 'PROJECTION', 
                text: 'Deploy predictions across 11 strategic categories. Balance risk and reward based on real-time grid intelligence.'
              },
              { 
                icon: '03', 
                title: 'DOMINATION', 
                text: 'Climb the podium of the technical leaderboard. Every overtake and mechanical failure is scored in real-time.'
              }
            ].map((step, idx) => (
              <Card 
                key={step.title}
                className="group border-white/5 bg-white/[0.01]"
              >
                <div className="text-4xl font-black text-white/5 mb-6 group-hover:text-f1-red/20 transition-colors italic">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-4">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {step.text}
                </p>
              </Card>
            ))}
          </div>

          <Card className="mt-20 border-f1-gold/20 relative overflow-hidden bg-white/[0.01]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="text-[10rem] font-bold select-none uppercase italic">DATA</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-12 uppercase tracking-[0.4em] text-center italic">ACTIVE SECTORS</h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {[
                'GP WINNER', 'POLE POSITION', 'PODIUM LOCK', 'FASTEST LAP', 
                'SPRINT KING', 'MIDFIELD HERO', 'SURPRISE GAIN', 'THE BIG FLOP', 
                'PIT ERROR', 'SAFETY CAR', 'THE CRAZY CALL'
              ].map(cat => (
                <span key={cat} className="px-5 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-bold text-f1-gold uppercase tracking-[0.2em] hover:bg-f1-gold hover:text-black transition-all cursor-default select-none shadow-sm">
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
