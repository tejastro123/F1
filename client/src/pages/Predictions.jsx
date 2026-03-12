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

  const rounds = useMemo(() => [...new Set(predictions.map(p => p.round))].sort((a, b) => a - b), [predictions]);

  const filtered = useMemo(() => {
    if (!roundFilter) return predictions;
    return predictions.filter(p => p.round === parseInt(roundFilter));
  }, [predictions, roundFilter]);

  const accuracy = useMemo(() => {
    const total = filtered.length;
    const correct = filtered.filter(p => p.isCorrect === true).length;
    const wrong = filtered.filter(p => p.isCorrect === false).length;
    const pending = filtered.filter(p => p.isCorrect === null).length;
    return { total, correct, wrong, pending, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }, [filtered]);

  const statusColor = (isCorrect) => {
    if (isCorrect === true) return 'green';
    if (isCorrect === false) return 'red';
    return 'orange';
  };

  const statusLabel = (isCorrect) => {
    if (isCorrect === true) return '✓ Correct';
    if (isCorrect === false) return '✗ Wrong';
    return '⏳ Pending';
  };

  return (
    <>
      <Helmet>
        <title>Predictions — F1 2026</title>
        <meta name="description" content="F1 2026 race prediction tracker" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Prediction Tracker" subtitle="Track your race predictions accuracy" />

        {/* Accuracy Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-3xl font-black text-f1-gold"><AnimatedCounter value={accuracy.pct} />%</div>
            <div className="text-xs text-gray-400 mt-1">ACCURACY</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-black text-green-400"><AnimatedCounter value={accuracy.correct} /></div>
            <div className="text-xs text-gray-400 mt-1">CORRECT</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-black text-f1-red"><AnimatedCounter value={accuracy.wrong} /></div>
            <div className="text-xs text-gray-400 mt-1">WRONG</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-black text-orange-400"><AnimatedCounter value={accuracy.pending} /></div>
            <div className="text-xs text-gray-400 mt-1">PENDING</div>
          </Card>
        </div>

        {/* Round filter */}
        <select
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="bg-f1-card border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-f1-red/50 mb-6"
          aria-label="Filter by round"
        >
          <option value="">All Rounds</option>
          {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
        </select>

        {loading ? (
          <SkeletonLoader lines={8} />
        ) : !isAuthenticated ? (
          <Card className="text-center py-16 px-4 bg-f1-dark/50 border border-white/5">
            <div className="text-5xl mb-6">🔮</div>
            <h3 className="text-2xl font-bold text-white mb-2">Predict the Podium</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Sign in to save your race predictions, track your accuracy over the entire season, and compete on the global leaderboard.
            </p>
            <button 
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`}
              className="bg-white hover:bg-gray-100 text-black text-sm px-6 py-3 rounded-full transition font-medium inline-flex items-center gap-3 shadow-lg"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Sign in with Google
            </button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3 opacity-50">📝</div>
            <p className="text-gray-400">You haven't made any predictions yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((pred, idx) => (
              <motion.div
                key={pred._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-f1-card rounded-xl border border-white/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Round {pred.round} · {pred.grandPrixName}</div>
                  <div className="font-medium text-white">{pred.category}</div>
                </div>
                <div className="flex items-center gap-4 sm:gap-8">
                  <div>
                    <div className="text-xs text-gray-500">Prediction</div>
                    <div className="text-sm font-medium text-f1-gold">{pred.prediction}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Actual</div>
                    <div className="text-sm font-medium text-white">{pred.actualResult}</div>
                  </div>
                  <Badge color={statusColor(pred.isCorrect)}>{statusLabel(pred.isCorrect)}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
