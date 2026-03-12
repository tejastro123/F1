import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { usePredictions } from '../hooks/useData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Badge, SectionHeader, AnimatedCounter, SkeletonLoader } from '../components/ui.jsx';

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
    'GP_WINNER': '🏆 Winner',
    'GP_POLE': '🏁 Pole',
    'PODIUM_P1': '🥇 P1',
    'PODIUM_P2': '🥈 P2',
    'PODIUM_P3': '🥉 P3',
    'SPRINT_WIN': '🏎 Sprint Win',
    'SPRINT_POLE': '⚡ Sprint Pole',
    'GOOD_SURPRISE': '🌟 Surprise',
    'BIG_FLOP': '💥 Flop',
    'P_WHAT': '❓ P-What?',
    'CRAZY_CALL': '🤯 Crazy Call'
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

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Prediction Tracker" subtitle="Track your accuracy across all 11 categories" />

        {/* Accuracy Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center bg-f1-card/30">
            <div className="text-3xl font-black text-f1-gold"><AnimatedCounter value={accuracy.pct} />%</div>
            <div className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">TOTAL ACCURACY</div>
          </Card>
          <Card className="text-center bg-f1-card/30">
            <div className="text-3xl font-black text-green-400"><AnimatedCounter value={accuracy.correct} /></div>
            <div className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">SUCCESSFUL</div>
          </Card>
          <Card className="text-center bg-f1-card/30">
            <div className="text-3xl font-black text-f1-red"><AnimatedCounter value={accuracy.wrong} /></div>
            <div className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">FAILED</div>
          </Card>
          <Card className="text-center bg-f1-card/30">
            <div className="text-3xl font-black text-white/40"><AnimatedCounter value={accuracy.pending} /></div>
            <div className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">REMAINING</div>
          </Card>
        </div>

        {/* Round filter */}
        <div className="flex justify-between items-center mb-6">
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="bg-f1-dark border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-f1-red/50"
            aria-label="Filter by round"
          >
            <option value="">All Race Rounds</option>
            {rawRoundsCount.map(r => <option key={r} value={r}>Round {r}</option>)}
          </select>
          <div className="text-xs text-gray-500 font-medium">Total: {predictions.length} predictions</div>
        </div>

        {loading ? (
          <SkeletonLoader lines={8} />
        ) : !isAuthenticated ? (
          <Card className="text-center py-16 px-4 bg-f1-dark/50 border border-white/5">
            <div className="text-5xl mb-6">🔮</div>
            <h3 className="text-2xl font-bold text-white mb-2">Predict the Season</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Sign in to save your race predictions across all 11 categories and climb the global leaderboard.
            </p>
            <button 
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`}
              className="bg-white hover:bg-gray-100 text-black text-sm px-6 py-3 rounded-full transition font-medium inline-flex items-center gap-3 shadow-lg"
            >
              Sign in with Google
            </button>
          </Card>
        ) : filteredRounds.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3 opacity-50">📝</div>
            <p className="text-gray-400">No predictions found for this filter.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredRounds.map((roundGroup, idx) => (
              <div key={roundGroup.round} className="space-y-3">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <div className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">
                    Round {roundGroup.round} · {roundGroup.gp}
                  </div>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roundGroup.list.map((pred, pIdx) => (
                    <motion.div
                      key={pred._id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: pIdx * 0.05 }}
                      className="bg-f1-card/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between gap-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] text-f1-gold font-bold uppercase tracking-wider mb-0.5">
                            {categoriesMap[pred.category] || pred.category}
                          </div>
                          <div className="text-base font-black text-white leading-tight">{pred.prediction}</div>
                        </div>
                        <Badge color={statusColor(pred.isCorrect)} className="text-[10px] px-2 py-0.5">
                          {pred.isCorrect === true ? 'CORRECT' : pred.isCorrect === false ? 'WRONG' : 'PENDING'}
                        </Badge>
                      </div>

                      {pred.actualResult !== 'TBD' && (
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center mt-2">
                          <span className="text-[10px] text-gray-500 font-medium">ACTUAL RESULT</span>
                          <span className="text-xs font-bold text-white">{pred.actualResult}</span>
                        </div>
                      )}
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
