import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext.jsx';

const EMOJIS = ['🔥', '🏎️', '😱', '👏', '🏁', '💜', '⚡', '🚧'];

export function ReactionCanvas() {
  const { socket } = useSocket();
  const [reactions, setReactions] = useState([]);

  const addReaction = useCallback((emoji) => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = Math.random() * 80 + 10;
    const rotation = Math.random() * 40 - 20;
    
    setReactions((prev) => [...prev, { id, emoji, x, rotation }]);
    
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleReaction = (emoji) => addReaction(emoji);
    socket.on('reaction-echo', handleReaction);
    return () => socket.off('reaction-echo', handleReaction);
  }, [socket, addReaction]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[110] overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
            animate={{ y: '-10vh', opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            className="absolute text-4xl"
            style={{ left: `${r.x}%`, rotate: `${r.rotation}deg` }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ReactionBar({ className = '' }) {
  const { socket } = useSocket();

  const sendReaction = (emoji) => {
    if (socket) {
      socket.emit('reaction-pulse', emoji);
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 p-3 bg-white/[0.02] backdrop-blur-3xl rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all ${className}`}>
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-f1-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          className="w-12 h-12 flex items-center justify-center text-2xl bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-f1-red/10 hover:border-f1-red/30 transition-all hover:scale-110 active:scale-95 shadow-sm"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
      
      <div className="absolute -top-1 left-6 px-2 py-0.5 bg-f1-red text-[8px] font-bold italic tracking-[0.3em] text-white uppercase rounded-sm shadow-lg pointer-events-none">
        LIVE REACTION
      </div>
    </div>
  );
}

export default function ReactionStream() {
  return (
    <>
      <ReactionCanvas />
      <ReactionBar className="mt-6" />
    </>
  );
}
