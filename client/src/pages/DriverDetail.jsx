import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api.js';
import { AnimatedCounter, Card, Button, StatPill, SectionHeader, SkeletonCard } from '../components/ui.jsx';
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

      <div className="pt-20 pb-16">
        {/* Hero Banner with Photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-80 md:h-[450px] overflow-hidden"
          style={{ background: getTeamGradient(driver.team) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-transparent to-black/30" />
          
          <div className="max-w-7xl mx-auto h-full relative px-4 flex items-end">
            <div className="grid md:grid-cols-2 w-full gap-8 pb-12 items-end">
              <div>
                <button onClick={() => navigate('/drivers')} className="text-white/70 hover:text-white text-sm mb-6 flex items-center gap-1">
                  ← Back to Standings
                </button>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-6xl font-black text-white/20">#{driver.driverNumber || '??'}</span>
                    <div className="text-white/60 text-lg font-medium">{driver.nationality}</div>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-tight uppercase italic">{driver.fullName}</h1>
                  <Badge color="gold" className="mt-4 px-4 py-1 text-base">{driver.team}</Badge>
                </motion.div>
              </div>
              
              {driver.photoUrl && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.4 }}
                  className="hidden md:flex justify-end"
                >
                  <img 
                    src={driver.photoUrl} 
                    alt={driver.fullName} 
                    className="h-[400px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Body */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left: Summary Stats & Bio */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Current Rank', value: driver.rank, icon: '🏆' },
                  { label: 'Points', value: driver.points, icon: '⭐' },
                  { label: 'Podiums', value: driver.podiums, icon: '🏅' },
                  { label: 'Grid Pos', value: `P${driver.gridPosition}`, icon: '📊' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                    <StatPill {...stat} className="bg-f1-card/80 backdrop-blur-md" />
                  </motion.div>
                ))}
              </div>

              <Card>
                <SectionHeader title="Biography" subtitle="Career Journey" />
                <p className="text-gray-300 text-lg leading-relaxed">
                  {driver.bio || 'Biography details are being curated for the 2026 season.'}
                </p>
              </Card>

              <Card>
                <SectionHeader title="Achievements" subtitle="Major Milestones" />
                <ul className="space-y-4">
                  {driver.achievements && driver.achievements.length > 0 ? (
                    driver.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-400">
                        <span className="text-f1-red text-xl">🏁</span>
                        <span className="text-lg">{ach}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No achievements listed yet.</p>
                  )}
                </ul>
              </Card>
            </div>

            {/* Right: Career Stats & Chart */}
            <div className="space-y-8">
              <Card>
                <SectionHeader title="Career Stats" subtitle="Historical Context" />
                <div className="space-y-4">
                  {[
                    { label: 'Total Wins', value: driver.careerStats?.wins || 0 },
                    { label: 'Total Podiums', value: driver.careerStats?.podiums || 0 },
                    { label: 'Pole Positions', value: driver.careerStats?.poles || 0 },
                    { label: 'Championships', value: driver.careerStats?.championships || 0 },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">{s.label}</span>
                      <span className="text-white font-bold text-xl">{s.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 overflow-hidden">
                <SectionHeader title="2026 Performance" subtitle="Points Build-up" />
                <div className="h-48 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="points"
                        stroke={getTeamColor(driver.team)}
                        strokeWidth={4}
                        dot={{ fill: getTeamColor(driver.team), r: 6 }}
                      />
                      <XAxis hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ background: '#111', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: getTeamColor(driver.team) }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Button variant="secondary" className="w-full py-4 text-lg" onClick={shareOrDownload}>
                📤 Share Profile Card
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
