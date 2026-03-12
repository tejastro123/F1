import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import api from '../services/api.js';
import { Card, SectionHeader, SkeletonLoader, Badge, AnimatedCounter, TeamColorStripe } from '../components/ui.jsx';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/predictions/leaderboard');
        setLeaderboard(data);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <>
      <Helmet>
        <title>Community Leaderboard — F1 2026</title>
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <SectionHeader 
          title="Community Leaderboard" 
          subtitle="Top predictors ranked by accuracy and correct calls" 
        />

        {loading ? (
          <SkeletonLoader lines={10} />
        ) : (
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <Card className="text-center py-12 text-gray-500">
                No predictions have been scored yet. Start predicting to climb the ranks!
              </Card>
            ) : (
              leaderboard.map((entry, idx) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="flex items-center gap-4 py-3 px-4 sm:px-6 relative overflow-hidden group">
                    <div className="flex items-center gap-4 min-w-[3rem]">
                      <span className={`text-2xl font-black ${
                        idx === 0 ? 'text-f1-gold' : 
                        idx === 1 ? 'text-f1-silver' : 
                        idx === 2 ? 'text-f1-bronze' : 
                        'text-gray-600'
                      }`}>
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <img 
                        src={entry.user.avatarUrl || `https://ui-avatars.com/api/?name=${entry.user.displayName}`} 
                        alt="" 
                        className="w-10 h-10 rounded-full border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{entry.user.displayName}</div>
                        <div className="text-xs text-gray-500">{entry.total} predictions made</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center hidden sm:block">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Accuracy</div>
                        <div className="font-black text-f1-gold"><AnimatedCounter value={Math.round(entry.accuracy)} />%</div>
                      </div>
                      <div className="text-right min-w-[4rem]">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Correct</div>
                        <div className="text-xl font-black text-white">{entry.correct}</div>
                      </div>
                    </div>

                    {idx === 0 && (
                      <div className="absolute right-0 top-0 h-full w-1 bg-f1-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                    )}
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
