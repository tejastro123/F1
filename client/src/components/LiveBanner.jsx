import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext.jsx';

export default function LiveBanner() {
  const { lastBroadcast } = useSocket();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastBroadcast) {
      setVisible(true);
      // Auto-hide after 15 seconds for non-critical messages? 
      // Actually, let's keep it until dismissed or new one arrives.
    }
  }, [lastBroadcast]);

  if (!lastBroadcast) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-[64px] left-0 right-0 z-[49] px-4 py-2 bg-f1-red text-white shadow-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-tighter shrink-0">Live Update</span>
            <span className="text-sm font-bold truncate">{lastBroadcast.message || lastBroadcast}</span>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className="ml-4 hover:bg-white/20 p-1 rounded-full transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
