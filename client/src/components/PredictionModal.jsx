import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui.jsx';
import { useDrivers } from '../hooks/useData.js';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { getTeamColor } from '../utils/teamColors.js';

export default function PredictionModal({ isOpen, onClose, race, onPredicted }) {
  const { drivers, loading: driversLoading } = useDrivers();
  const { isAuthenticated } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !race) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`;
      return;
    }

    if (!selectedDriver) {
      setError('Please select a driver to win.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post('/predictions', {
        round: race.round,
        category: 'P1 (Winner)',
        prediction: selectedDriver,
        grandPrixName: race.grandPrixName
      });
      onPredicted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prediction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-f1-dark/90 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-f1-panel border border-white/10 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl overflow-hidden text-left"
        >
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-black text-white mb-1">Predict the Winner</h3>
            <p className="text-gray-400 text-sm">
              Round {race.round} · {race.grandPrixName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Who will cross the finish line first?
              </label>
              
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {driversLoading ? (
                  <p className="text-gray-500 text-sm">Loading grid...</p>
                ) : (
                  drivers.map(d => (
                    <label
                      key={d._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDriver === d.fullName
                          ? 'border-f1-gold bg-f1-gold/10'
                          : 'border-white/5 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="prediction"
                        value={d.fullName}
                        checked={selectedDriver === d.fullName}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="hidden"
                      />
                      <div 
                        className="w-1.5 h-6 rounded-full" 
                        style={{ backgroundColor: getTeamColor(d.team) }} 
                      />
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{d.fullName}</div>
                        <div className="text-gray-400 text-xs">{d.team}</div>
                      </div>
                      {selectedDriver === d.fullName && (
                        <div className="text-f1-gold">✓</div>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {error && (
              <div className="text-f1-red text-sm font-medium p-3 bg-f1-red/10 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={isAuthenticated ? 'gold' : 'secondary'}
                className="flex-1"
                disabled={submitting || driversLoading}
              >
                {submitting ? 'Saving...' : !isAuthenticated ? 'Sign In to Predict' : 'Lock Prediction'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
