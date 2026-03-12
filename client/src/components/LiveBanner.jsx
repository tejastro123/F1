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
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-[74px] left-6 right-6 z-[95] overflow-hidden"
        >
          <div className="bg-f1-red/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-hidden">
               <div className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
               </div>
               <div className="h-6 w-[1px] bg-white/20" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/60 leading-none mb-1">Grid Priority Alert</span>
                  <span className="text-xs font-black text-white uppercase italic tracking-widest leading-none truncate">
                     {lastBroadcast.message || lastBroadcast}
                  </span>
               </div>
            </div>
            
            <button 
              onClick={() => setVisible(false)}
              className="ml-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
