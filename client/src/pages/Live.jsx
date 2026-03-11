import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSocket } from '../context/SocketContext.jsx';
import { Card, Badge, SectionHeader } from '../components/ui.jsx';

export default function Live() {
  const { isConnected, broadcasts, lastBroadcast } = useSocket();

  return (
    <>
      <Helmet>
        <title>Live — F1 2026</title>
        <meta name="description" content="Live F1 race updates and broadcasts" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <SectionHeader title="Live Feed" subtitle="Real-time race updates and admin broadcasts" />

        {/* Connection Status */}
        <Card className="mb-6">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-live-pulse' : 'bg-red-500'}`} />
            <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            <Badge color={isConnected ? 'green' : 'red'}>{isConnected ? 'LIVE' : 'OFFLINE'}</Badge>
          </div>
        </Card>

        {/* Latest Broadcast */}
        {lastBroadcast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-f1-red/20 to-f1-card rounded-xl border border-f1-red/30 p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-f1-red rounded-full animate-live-pulse" />
              <span className="text-f1-red text-sm font-bold uppercase">Latest Broadcast</span>
            </div>
            <p className="text-xl font-bold text-white">{lastBroadcast.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(lastBroadcast.timestamp).toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* Broadcast History */}
        <h3 className="text-lg font-bold mb-4 text-gray-300">Broadcast History</h3>
        {broadcasts.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-gray-400">No broadcasts yet</p>
            <p className="text-gray-500 text-sm mt-1">Updates will appear here when your admin sends a broadcast</p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {broadcasts.map((b, idx) => (
                <motion.div
                  key={b.timestamp + idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-f1-card rounded-xl border border-white/5 p-4 flex items-start gap-3"
                >
                  <div className="w-2 h-2 bg-f1-red rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{b.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(b.timestamp).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
