import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext.jsx';

const EMOJIS = ['🔥', '🏎️', '😱', '👏', '🏁', '💜', '⚡', '🚧'];

export default function ReactionStream() {
  const { socket } = useSocket();
  const [reactions, setReactions] = useState([]);

  const addReaction = useCallback((emoji) => {
    const id = Math.random().toString(36).substr(2, 9);
    // Random position and rotation
    const x = Math.random() * 80 + 10; // 10% to 90%
    const rotation = Math.random() * 40 - 20; // -20 to 20 deg
    
    setReactions((prev) => [...prev, { id, emoji, x, rotation }]);
    
    // Remove after animation
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReaction = (emoji) => {
      addReaction(emoji);
    };

    socket.on('reaction-echo', handleReaction);
    return () => socket.off('reaction-echo', handleReaction);
  }, [socket, addReaction]);

  const sendReaction = (emoji) => {
    if (socket) {
      socket.emit('reaction-pulse', emoji);
      addReaction(emoji); // Local feedback
    }
  };

  return (
    <div className="relative">
      {/* Floating Canvas */}
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

      {/* Button Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-6 translate-z-0">
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-f1-red text-[8px] font-black italic tracking-widest text-white uppercase rounded">
          Live Reactions
        </div>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="w-10 h-10 flex items-center justify-center text-xl bg-f1-panel border border-white/5 rounded-xl hover:bg-f1-red/20 hover:border-f1-red/30 transition-all hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
