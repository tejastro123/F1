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
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 md:h-80 overflow-hidden"
          style={{ background: getTeamGradient(driver.team) }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto w-full px-4 pb-8">
              <button onClick={() => navigate('/drivers')} className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-1">
                ← Back to Standings
              </button>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="text-white/60 text-sm font-medium mb-1">P{driver.rank} · {driver.nationality}</div>
                <h1 className="text-4xl md:text-5xl font-black text-white">{driver.fullName}</h1>
                <div className="text-white/80 text-lg mt-1">{driver.team}</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: '⭐', label: 'Points', value: driver.points },
              { icon: '🏆', label: 'Wins', value: driver.wins },
              { icon: '🏅', label: 'Podiums', value: driver.podiums },
              { icon: '📊', label: 'Grid Position', value: driver.gridPosition },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <StatPill icon={stat.icon} label={stat.label} value={stat.value} className="h-full" />
              </motion.div>
            ))}
          </div>

          {/* Points Chart */}
          <Card className="mb-8">
            <SectionHeader title="Points Progression" subtitle="Race-by-race performance" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="race" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1C1C28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke={getTeamColor(driver.team)}
                    strokeWidth={3}
                    dot={{ fill: getTeamColor(driver.team), r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Share Button */}
          <div className="flex justify-center mb-8">
            <Button variant="secondary" onClick={shareOrDownload}>
              📤 Share Driver Card
            </Button>
          </div>

          {/* Hidden share card for html2canvas */}
          <div className="fixed -left-[9999px] top-0">
            <ShareCard driver={driver} cardRef={cardRef} />
          </div>
        </div>
      </div>
    </>
  );
}
