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

  const correct = predictions.filter(p => p.isCorrect === true).length;
  const total = predictions.length;

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
          <div className="space-y-3">
            {predictions.map((pred) => (
              <Card key={pred._id} hover={false} className="!p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Round {pred.round} · {pred.grandPrixName}</div>
                    <div className="font-medium text-white">{pred.category}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Prediction: <span className="text-f1-gold">{pred.prediction}</span>
                      {pred.actualResult !== 'TBD' && <> · Actual: <span className="text-white">{pred.actualResult}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={pred.isCorrect === true ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => toggle(pred, pred.isCorrect === true ? null : true)}
                    >
                      ✓ Correct
                    </Button>
                    <Button
                      variant={pred.isCorrect === false ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => toggle(pred, pred.isCorrect === false ? null : false)}
                    >
                      ✗ Wrong
                    </Button>
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
