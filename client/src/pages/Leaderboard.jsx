import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import api from '../services/api.js';
import { Card, SectionHeader, SkeletonLoader, Badge, AnimatedCounter, TeamColorStripe, SkeletonCard } from '../components/ui.jsx';

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

      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto overflow-x-hidden">
        <SectionHeader 
          title="THE HALL OF FAME" 
          subtitle="Legends of the prediction grid ranked by mechanical accuracy" 
        />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-20 opacity-30 italic font-black text-white uppercase tracking-[0.4em]">
                Records pending scoring...
              </div>
            ) : (
              leaderboard.map((entry, idx) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card glass className={`flex items-center gap-6 p-6 rounded-[2rem] border-white/5 group transition-all hover:bg-white/[0.08] hover:border-white/10 ${
                    idx === 0 ? 'bg-f1-gold/5 border-f1-gold/20' : 
                    idx === 1 ? 'bg-f1-silver/5 border-f1-silver/20' : 
                    idx === 2 ? 'bg-f1-bronze/5 border-f1-bronze/20' : ''
                  }`}>
                    {/* Rank Indicator */}
                    <div className="flex flex-col items-center justify-center min-w-[50px]">
                      <span className={`text-4xl font-black italic ${
                        idx === 0 ? 'text-f1-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 
                        idx === 1 ? 'text-f1-silver' : 
                        idx === 2 ? 'text-f1-bronze' : 
                        'text-white/20'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest -mt-1">POS</span>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative group-hover:scale-110 transition-transform">
                        <img 
                          src={entry.user.avatarUrl || `https://ui-avatars.com/api/?name=${entry.user.displayName}`} 
                          alt="" 
                          className={`w-14 h-14 rounded-full border-2 ${
                             idx === 0 ? 'border-f1-gold' : 'border-white/10'
                          } shadow-2xl bg-f1-dark`}
                        />
                        {idx === 0 && <span className="absolute -top-1 -right-1 text-xl">👑</span>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-white uppercase italic tracking-tighter text-xl leading-none truncate group-hover:text-f1-red transition-colors">
                          {entry.user.displayName}
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">
                           <span className="text-f1-gold">{entry.total}</span> Predictions Logged
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Accuracy</div>
                        <div className="text-2xl font-black italic text-f1-gold leading-none">
                          <AnimatedCounter value={Math.round(entry.accuracy)} />%
                        </div>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Correct</div>
                        <div className="text-2xl font-black italic text-white leading-none">
                          <AnimatedCounter value={entry.correct} />
                        </div>
                      </div>
                    </div>

                    {/* Subtle Rank Stripe */}
                    {idx < 3 && (
                      <div className={`absolute right-0 top-0 bottom-0 w-1 ${
                        idx === 0 ? 'bg-f1-gold shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 
                        idx === 1 ? 'bg-f1-silver' : 'bg-f1-bronze'
                      }`} />
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
