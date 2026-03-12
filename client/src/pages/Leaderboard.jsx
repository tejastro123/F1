import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLeaderboard } from '../hooks/useData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SectionHeader, SkeletonLoader, Badge, AnimatedCounter, Card } from '../components/ui.jsx';

export default function Leaderboard() {
  const { leaderboard, loading } = useLeaderboard();
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>Global Leaderboard — F1 2026</title>
        <meta name="description" content="F1 2026 Season Global Fan Prediction Leaderboard" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader 
          title="Global Leaderboard" 
          subtitle="Compete with fans worldwide. Accurate predictions earn you a spot at the top." 
        />

        {loading ? (
          <SkeletonLoader lines={12} />
        ) : leaderboard.length === 0 ? (
          <Card className="text-center py-16 px-4 border border-white/5">
            <div className="text-5xl mb-6 opacity-80">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Predictions Yet</h3>
            <p className="text-gray-400">
              The season hasn't started or no one has made a prediction yet. Be the first!
            </p>
          </Card>
        ) : (
          <div className="bg-f1-card/50 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="py-4 px-6 w-16 text-center">Rank</th>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6 text-right">Points</th>
                    <th className="py-4 px-6 text-right">Accuracy</th>
                    <th className="py-4 px-6 text-right w-24">Correct</th>
                    <th className="py-4 px-6 text-right w-24">Wrong</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((player, idx) => {
                    const isMe = user && user.id === player.userId;
                    
                    return (
                      <motion.tr
                        key={player.userId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`transition-colors ${isMe ? 'bg-f1-red/10 hover:bg-f1-red/20' : 'hover:bg-white/5'}`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          {idx === 0 ? (
                            <span className="text-2xl">🥇</span>
                          ) : idx === 1 ? (
                            <span className="text-2xl">🥈</span>
                          ) : idx === 2 ? (
                            <span className="text-2xl">🥉</span>
                          ) : (
                            <span className="text-gray-400 font-bold">{idx + 1}</span>
                          )}
                        </td>
                        
                        {/* User Profile */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={player.displayName} className="w-8 h-8 rounded-full border border-white/20" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-f1-dark text-white flex items-center justify-center font-bold text-xs border border-white/10">
                                {player.displayName ? player.displayName[0].toUpperCase() : 'U'}
                              </div>
                            )}
                            <div>
                              <div className={`font-bold ${isMe ? 'text-f1-red' : 'text-white'}`}>
                                {player.displayName || 'Unknown Fan'} {isMe && '(You)'}
                              </div>
                              <div className="text-xs text-gray-500">{player.totalPredictions} total picks</div>
                            </div>
                          </div>
                        </td>

                        {/* Points */}
                        <td className="py-4 px-6 text-right font-black text-xl text-f1-red">
                          <AnimatedCounter value={player.totalPoints || 0} />
                        </td>
                        
                        {/* Accuracy metric */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <span className={`text-md font-bold ${
                              player.accuracyScore >= 80 ? 'text-f1-gold' : 
                              player.accuracyScore >= 50 ? 'text-green-400' : 
                              player.accuracyScore > 0 ? 'text-orange-400' : 'text-gray-500'
                            }`}>
                              <AnimatedCounter value={player.accuracyScore} />%
                            </span>
                          </div>
                        </td>

                        {/* Raw Stats */}
                        <td className="py-4 px-6 text-right font-medium text-green-400">{player.correct}</td>
                        <td className="py-4 px-6 text-right font-medium text-f1-red">{player.wrong}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
