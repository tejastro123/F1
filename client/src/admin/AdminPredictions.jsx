import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { Card, Button, Badge, SectionHeader, SkeletonLoader, AnimatedCounter } from '../components/ui.jsx';

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/predictions');
        setPredictions(data);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const toggle = async (pred, value) => {
    try {
      const { data } = await api.patch(`/admin/predictions/${pred._id}`, { isCorrect: value });
      setPredictions(prev => prev.map(p => p._id === pred._id ? data : p));
    } catch { /* */ }
  };

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
    'CRAZY_CALL': '🤯 CRAZY'
  };

  return (
    <>
      <Helmet><title>Predictions — F1 2026 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <SectionHeader title="Manage Predictions" subtitle="Mark predictions as correct or wrong" />

        <Card className="mb-6 text-center">
          <div className="text-2xl font-black text-f1-gold"><AnimatedCounter value={total > 0 ? Math.round((correct / total) * 100) : 0} />%</div>
          <div className="text-sm text-gray-400">{correct} of {total} correct</div>
        </Card>

        {loading ? <SkeletonLoader lines={8} /> : (
          <div className="space-y-4">
            {predictions.map((pred) => (
              <Card key={pred._id} hover={false} className="!p-0 border-white/5 bg-f1-card/40 overflow-hidden">
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                  {/* User Profile Info */}
                  <div className="p-4 sm:w-48 bg-white/5 flex flex-row sm:flex-col items-center sm:items-start gap-3">
                    <img 
                      src={pred.user?.avatarUrl || `https://ui-avatars.com/api/?name=${pred.user?.displayName || 'User'}`} 
                      alt="" 
                      className="w-8 h-8 rounded-full border border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-white font-black uppercase tracking-wider truncate">{pred.user?.displayName || 'Unknown'}</div>
                      <div className="text-[9px] text-gray-500 truncate">{pred.user?.email}</div>
                    </div>
                  </div>

                  {/* Prediction Content */}
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-500 font-bold mb-1">ROUND {pred.round} · {pred.grandPrixName}</div>
                      <div className="font-bold text-f1-gold text-sm uppercase tracking-wide">{categoriesMap[pred.category] || pred.category}</div>
                      <div className="text-base font-black text-white mt-0.5 truncate">{pred.prediction}</div>
                      {pred.actualResult !== 'TBD' && (
                        <div className="text-[10px] text-gray-400 font-medium mt-1">
                          ACTUAL: <span className="text-white">{pred.actualResult}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={pred.isCorrect === true ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => toggle(pred, true)}
                        className="flex-1 sm:flex-initial !py-1.5 h-auto text-[10px] font-black"
                      >
                        ✓ CORRECT
                      </Button>
                      <Button
                        variant={pred.isCorrect === false ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => toggle(pred, false)}
                        className="flex-1 sm:flex-initial !py-1.5 h-auto text-[10px] font-black"
                      >
                        ✗ WRONG
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
