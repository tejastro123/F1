import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api.js';
import { AnimatedCounter, Card, Button, StatPill, SectionHeader, SkeletonCard, Badge } from '../components/ui.jsx';
import { getTeamColor, getTeamGradient } from '../utils/teamColors.js';
import { ShareCard, useShareCard } from '../components/ShareCard.jsx';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cardRef, shareOrDownload } = useShareCard();

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const { data } = await api.get(`/drivers/${id}`);
        setDriver(data);
      } catch {
        navigate('/drivers');
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id, navigate]);

  if (loading) return <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto"><SkeletonCard /><SkeletonCard /></div>;
  if (!driver) return null;

  const chartData = [
    { race: 'R1', points: driver.points },
  ];

  return (
    <>
      <Helmet>
        <title>{driver.fullName} — F1 2026</title>
        <meta name="description" content={`${driver.fullName} - ${driver.team} - 2026 F1 Championship Profile`} />
      </Helmet>

      <div className="pt-16 pb-16 overflow-x-hidden">
        {/* Elite Hero Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative min-h-[450px] md:h-[600px] flex items-end overflow-hidden"
          style={{ background: getTeamGradient(driver.team) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-f1-dark/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://www.formula1.com/etc/designs/fom-website/images/f1-carbon-bg.png')] opacity-20 mix-blend-overlay" />
          
          <div className="max-w-7xl mx-auto w-full relative z-20 px-8 pb-16">
            <div className="grid md:grid-cols-2 gap-12 items-end">
              <div className="space-y-6">
                <button 
                  onClick={() => navigate('/drivers')} 
                  className="group flex items-center gap-3 text-[10px] font-black text-white/50 uppercase tracking-[0.3em] hover:text-f1-red transition-colors"
                >
                  <span className="w-8 h-[2px] bg-white/20 group-hover:bg-f1-red transition-all" />
                  Grid Standings
                </button>
                
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-6 mb-4">
                    <span className="text-7xl md:text-9xl font-black text-white/10 italic tracking-tighter leading-none">#{driver.driverNumber || '??'}</span>
                    <div className="h-12 w-[1px] bg-white/10" />
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">{driver.nationality}</div>
                      <Badge color="gold" className="!rounded-lg !px-3 font-black text-[10px]">{driver.team}</Badge>
                    </div>
                  </div>
                  <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.85] uppercase italic tracking-tighter drop-shadow-2xl">
                    {driver.fullName.split(' ')[0]}<br/>
                    <span className="text-f1-red">{driver.fullName.split(' ')[1]}</span>
                  </h1>
                </motion.div>
              </div>
              
              {driver.photoUrl && (
                <motion.div 
                  initial={{ x: 100, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  transition={{ delay: 0.4, type: 'spring', damping: 20 }}
                  className="hidden md:flex justify-end"
                >
                  <img 
                    src={driver.photoUrl} 
                    alt="" 
                    className="h-[550px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Ecosystem */}
        <div className="max-w-7xl mx-auto px-8 -mt-12 relative z-30">
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* Left: Summary Stats & Body */}
            <div className="lg:col-span-2 space-y-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'CHAMP RANK', value: driver.rank, icon: '🏆', color: 'text-f1-gold' },
                  { label: 'SEASON PTS', value: driver.points, icon: '⚡', color: 'text-white' },
                  { label: 'PODIUMS', value: driver.podiums, icon: '🎖️', color: 'text-f1-silver' },
                  { label: 'LAST START', value: `P${driver.gridPosition}`, icon: '🚦', color: 'text-f1-red' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                    <Card glass className="p-6 text-center border-white/5 rounded-[2.5rem] shadow-2xl">
                       <div className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">{stat.label}</div>
                       <div className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>
                          {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value}
                       </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card glass className="rounded-[3rem] p-12 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-f1-red" /> DRIVER BIOGRAPHY
                </h3>
                <p className="text-gray-400 text-xl leading-relaxed italic font-medium">
                  {driver.bio || 'Biography details are being curated for the 2026 season.'}
                </p>
                
                {driver.achievements && driver.achievements.length > 0 && (
                  <div className="mt-16">
                     <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8">MAJOR MILESTONES</h4>
                     <div className="grid sm:grid-cols-2 gap-4">
                        {driver.achievements.map((ach, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                             <span className="text-f1-red text-xl opacity-40 group-hover:opacity-100 transition-opacity">🏁</span>
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-snug">{ach}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Career & Analytics */}
            <div className="space-y-10">
              <Card glass className="rounded-[3rem] p-10 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10">Career Stats</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Total Wins', value: driver.careerStats?.wins || 0 },
                    { label: 'Podiums', value: driver.careerStats?.podiums || 0 },
                    { label: 'Poles', value: driver.careerStats?.poles || 0 },
                    { label: 'Titles', value: driver.careerStats?.championships || 0 },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-end border-b border-white/5 pb-4">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">{s.label}</span>
                      <span className="text-3xl font-black text-white italic tracking-tighter leading-none">{s.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card glass className="rounded-[3rem] p-8 border-white/5 bg-white/[0.01] overflow-hidden">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8">2026 Performance Map</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="points"
                        stroke={getTeamColor(driver.team)}
                        strokeWidth={6}
                        dot={{ fill: getTeamColor(driver.team), r: 8, stroke: '#000', strokeWidth: 2 }}
                        className="filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      />
                      <XAxis hide />
                      <YAxis hide domain={['auto', 'auto']} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-6">
                   <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest tracking-[0.4em]">Trajectory: ASCENDING</div>
                </div>
              </Card>

              <Button variant="primary" className="w-full py-6 !rounded-[2rem] shadow-2xl" onClick={shareOrDownload}>
                LAUNCH PROFILE CARD 📤
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
