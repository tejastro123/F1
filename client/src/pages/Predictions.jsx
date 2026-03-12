import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { usePredictions } from '../hooks/useData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Badge, SectionHeader, AnimatedCounter, SkeletonLoader, SkeletonCard, Button } from '../components/ui.jsx';

export default function Predictions() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { predictions, loading: dataLoading } = usePredictions();
  const [roundFilter, setRoundFilter] = useState('');

  const loading = authLoading || dataLoading;

  const rounds = useMemo(() => {
    const rMap = {};
    predictions.forEach(p => {
      if (!rMap[p.round]) rMap[p.round] = { round: p.round, gp: p.grandPrixName, list: [] };
      rMap[p.round].list.push(p);
    });
    return Object.values(rMap).sort((a, b) => b.round - a.round);
  }, [predictions]);

  const filteredRounds = useMemo(() => {
    if (!roundFilter) return rounds;
    return rounds.filter(r => r.round === parseInt(roundFilter));
  }, [rounds, roundFilter]);

  const rawRoundsCount = useMemo(() => [...new Set(predictions.map(p => p.round))].sort((a, b) => a - b), [predictions]);

  const accuracy = useMemo(() => {
    const total = predictions.length;
    const correct = predictions.filter(p => p.isCorrect === true).length;
    const wrong = predictions.filter(p => p.isCorrect === false).length;
    const pending = predictions.filter(p => p.isCorrect === null).length;
    return { total, correct, wrong, pending, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }, [predictions]);

  const categoriesMap = {
    'GP_WINNER': '🏆 GPRIX WIN',
    'GP_POLE': '🏁 GPRIX POLE',
    'TOP1': '🥇 TOP1',
    'TOP2': '🥈 TOP2',
    'TOP3': '🥉 TOP3',
    'SPRINT_WIN': '🏎 SPRINT WIN',
    'SPRINT_POLE': '⚡ SPRINT POLE',
    'GOOD_SURPRISE': '🌟 GOOD SURPRISE',
    'BIG_FLOP': '💥 BIG FLOP',
    'P_WHAT': '❓ PWHAT?',
    'CRAZY': '🤯 CRAZY'
  };

  const statusColor = (isCorrect) => {
    if (isCorrect === true) return 'green';
    if (isCorrect === false) return 'red';
    return 'orange';
  };

  return (
    <>
      <Helmet>
        <title>Predictions — F1 2026</title>
        <meta name="description" content="F1 2026 race prediction tracker" />
      </Helmet>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title="THE PREDICTOR" subtitle="Real-time accuracy tracking and historical race insights" />

        {/* Global Accuracy - Command Center Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'CRACKED %', value: accuracy.pct, color: 'text-f1-gold', sub: 'OVERALL ACCURACY' },
            { label: 'SECURED', value: accuracy.correct, color: 'text-green-500', sub: 'CORRECT CALLS' },
            { label: 'FAILED', value: accuracy.wrong, color: 'text-f1-red', sub: 'LOST BETS' },
            { label: 'PENDING', value: accuracy.pending, color: 'text-white/40', sub: 'ON THE LINE' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card glass className="p-6 text-center border-white/5 rounded-[2.5rem] shadow-2xl">
                <div className={`text-4xl font-black italic tracking-tighter ${stat.color} leading-none mb-1`}>
                  <AnimatedCounter value={stat.value} />{stat.label.includes('%') ? '%' : ''}
                </div>
                <div className="text-[8px] font-black text-white uppercase tracking-[0.3em] mb-3">{stat.label}</div>
                <div className="text-[7px] font-black text-gray-600 uppercase tracking-[0.2em]">{stat.sub}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Round Filter - Refined */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
           <Card glass className="p-1 px-4 border-white/10 rounded-2xl flex items-center group w-full sm:w-auto">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">FILTER:</span>
              <select
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                className="bg-transparent border-none py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-f1-dark">EVERY ROUND</option>
                {rawRoundsCount.map(r => <option key={r} value={r} className="bg-f1-dark uppercase">ROUND {String(r).padStart(2, '0')}</option>)}
              </select>
           </Card>
           <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{predictions.length} Total Predictions Recorded</div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !isAuthenticated ? (
          <Card glass className="rounded-[3rem] p-16 text-center border-white/10 bg-white/[0.01]">
            <div className="text-7xl mb-10 drop-shadow-2xl grayscale opacity-50">🔮</div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">LOCK YOUR LEGACY</h3>
            <p className="text-gray-500 font-medium max-w-lg mx-auto mb-10">
              Join the official 2026 grid to save your race predictions across 11 high-stakes categories and battle for the global title.
            </p>
            <Button variant="primary" size="lg" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`}>
              SECURE YOUR PIT ENTRY
            </Button>
          </Card>
        ) : filteredRounds.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <div className="text-6xl mb-6 italic font-black text-white">NO RECORDS</div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Grid Spotted</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredRounds.map((roundGroup, idx) => (
              <div key={roundGroup.round} className="space-y-6">
                <div className="flex items-center gap-6">
                   <div className="text-2xl font-black text-white/5 uppercase italic tracking-tighter">RND {String(roundGroup.round).padStart(2, '0')}</div>
                   <div className="h-[2px] flex-1 bg-gradient-to-r from-white/5 via-white/5 to-transparent"></div>
                   <div className="text-[10px] font-black text-f1-red uppercase tracking-[0.3em] italic">{roundGroup.gp}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roundGroup.list.map((pred, pIdx) => (
                    <motion.div
                      key={pred._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pIdx * 0.05 }}
                      className="group relative"
                    >
                      <Card glass className={`h-full rounded-[2rem] p-6 border-white/5 transition-all group-hover:bg-white/[0.08] ${
                        pred.isCorrect === true ? 'border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]' : 
                        pred.isCorrect === false ? 'border-f1-red/20 shadow-[0_0_30px_rgba(225,6,0,0.05)]' : ''
                      }`}>
                         <div className="flex justify-between items-start mb-6">
                            <span className="text-[8px] font-black text-f1-gold uppercase tracking-[0.3em]">{categoriesMap[pred.category] || pred.category}</span>
                            <Badge color={statusColor(pred.isCorrect)} className="text-[8px] font-black scale-90">
                               {pred.isCorrect === true ? 'VERIFIED' : pred.isCorrect === false ? 'FAILED' : 'PENDING'}
                            </Badge>
                         </div>

                         <div className="mb-8">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">PREDICTION:</div>
                            <div className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-f1-red transition-colors">{pred.prediction}</div>
                         </div>

                         {pred.actualResult !== 'TBD' && (
                           <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                              <div>
                                 <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-0.5">ACTUAL OUTCOME</div>
                                 <div className="text-sm font-black text-white uppercase italic tracking-tighter">{pred.actualResult}</div>
                              </div>
                              <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                                 {pred.isCorrect ? '✅' : '❌'}
                              </div>
                           </div>
                         )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
