import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { usePredictions } from '../hooks/useData.js';
import { Card, Badge, SectionHeader, AnimatedCounter, SkeletonLoader } from '../components/ui.jsx';

export default function Predictions() {
  const { predictions, loading } = usePredictions();
  const [roundFilter, setRoundFilter] = useState('');

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
