import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import { Card } from '../ui.jsx';

export default function PredictionHeatmap({ round }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/admin/predictions`);
        // Filter for specific round and group by prediction
        const currentRound = data.filter(p => p.round === round && p.category === 'GP_WINNER');
        
        const counts = currentRound.reduce((acc, p) => {
          acc[p.prediction] = (acc[p.prediction] || 0) + 1;
          return acc;
        }, {});

        const sorted = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats(sorted);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetchStats();
  }, [round]);

  if (loading) return <div className="animate-pulse bg-white/5 h-48 rounded-2xl" />;
  if (stats.length === 0) return null;

  const total = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <Card className="relative border-white/5 bg-white/5">
      <div className="absolute -top-3 left-6 px-2 py-0.5 bg-f1-red text-[8px] font-black italic tracking-widest text-white uppercase rounded shadow-lg">
        Community Sentiment
      </div>
      
      <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest mt-2 px-1">Winning Probability</h3>
      
      <div className="space-y-6">
        {stats.map((s, idx) => {
          const percentage = (s.count / total) * 100;
          return (
            <div key={s.name} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-white uppercase">{s.name}</span>
                <span className="text-f1-red font-bold">{Math.round(percentage)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: idx * 0.1, duration: 1 }}
                  className="h-full bg-gradient-to-r from-f1-red to-f1-primary"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
