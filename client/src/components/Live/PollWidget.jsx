import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Card, Button, AnimatedCounter } from '../ui.jsx';

export default function PollWidget() {
  const { socket } = useSocket();
  const [poll, setPoll] = useState(null);
  const [votedId, setVotedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActivePoll = async () => {
    try {
      const { data } = await api.get('/live/polls/active');
      setPoll(data);
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchActivePoll();

    if (!socket) return;
    
    socket.on('poll-created', (newPoll) => {
      setPoll(newPoll);
      setVotedId(null);
    });

    socket.on('poll-updated', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    return () => {
      socket.off('poll-created');
      socket.off('poll-updated');
    };
  }, [socket]);

  const handleVote = async (index) => {
    if (votedId !== null || !poll) return;
    try {
      setVotedId(index);
      await api.post(`/live/polls/${poll._id}/vote`, { optionIndex: index });
    } catch {
      setVotedId(null);
    }
  };

  if (loading) return <div className="animate-pulse bg-white/5 h-48 rounded-2xl" />;
  if (!poll) return null;

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card className="border-f1-gold/20 bg-f1-gold/5 overflow-hidden">
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-f1-gold text-[8px] font-black italic tracking-widest text-black uppercase rounded shadow-lg">
          Fan Pulse
        </div>
        
        <h3 className="text-xl font-black text-white mb-4 mt-2 pr-8">{poll.question}</h3>
        
        <div className="space-y-3">
          {poll.options.map((option, idx) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isVoted = votedId === idx;
            
            return (
              <button
                key={idx}
                disabled={votedId !== null}
                onClick={() => handleVote(idx)}
                className={`w-full group relative h-12 rounded-xl border transition-all text-left px-4 overflow-hidden ${
                  isVoted ? 'border-f1-gold bg-f1-gold/10' : 'border-white/5 hover:border-white/20 bg-white/5'
                }`}
              >
                {/* Result Bar */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: votedId !== null ? `${percentage}%` : 0 }}
                  className={`absolute left-0 top-0 h-full ${isVoted ? 'bg-f1-gold/20' : 'bg-white/10'}`}
                />
                
                <div className="relative z-10 flex items-center justify-between h-full">
                  <span className={`text-sm font-bold ${isVoted ? 'text-f1-gold' : 'text-gray-300'}`}>
                    {option.text}
                  </span>
                  {votedId !== null && (
                    <span className="text-xs font-black text-white">
                      <AnimatedCounter value={Math.round(percentage)} />%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
          {totalVotes} Votes recorded
        </div>
      </Card>
    </motion.div>
  );
}
