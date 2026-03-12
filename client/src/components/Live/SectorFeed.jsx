import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Card } from '../ui.jsx';

export default function SectorFeed() {
  const { socket } = useSocket();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data } = await api.get('/live/updates');
        setUpdates(data);
      } catch { /* */ }
    };
    fetchUpdates();

    if (!socket) return;
    
    socket.on('live-update', (newUpdate) => {
      setUpdates((prev) => [newUpdate, ...prev]);
    });

    return () => socket.off('live-update');
  }, [socket]);

  const getBadgeColor = (type) => {
    switch (type) {
      case 'YELLOW_FLAG': return 'bg-yellow-500 text-black';
      case 'RED_FLAG': return 'bg-f1-red text-white';
      case 'GREEN_FLAG': return 'bg-green-500 text-white';
      case 'PURPLE_SECTOR': return 'bg-purple-600 text-white';
      default: return 'bg-white/10 text-gray-400';
    }
  };

  return (
    <Card className="relative h-[600px] flex flex-col p-0 border-white/5 bg-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/5 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-f1-red rounded-full animate-live-pulse" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Sector Feed</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {updates.map((update, idx) => (
            <motion.div
              key={update._id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 relative"
            >
              {/* Timeline line */}
              {idx < updates.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-white/5" />
              )}
              
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 bg-f1-panel flex items-center justify-center text-[10px] font-black z-10">
                {new Date(update.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
              </div>
              
              <div className="flex-1 pb-4">
                <div className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1 ${getBadgeColor(update.type)}`}>
                  {update.type.replace('_', ' ')}
                </div>
                <p className="text-sm text-gray-200 font-medium leading-relaxed">
                  {update.driver && <span className="text-f1-gold font-black mr-2 uppercase">{update.driver}</span>}
                  {update.message}
                </p>
                {update.sector && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`w-8 h-1 rounded-full ${update.sector === s ? 'bg-purple-500' : 'bg-white/5'}`} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {updates.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-sm">
              Waiting for live telemetry...
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
