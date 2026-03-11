import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';
import { Card, Button, SectionHeader } from '../components/ui.jsx';

export default function AdminBroadcast() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/admin/broadcast', { message });
      setHistory(prev => [{ message, timestamp: new Date().toISOString() }, ...prev]);
      setMessage('');
    } catch { /* */ } finally { setSending(false); }
  };

  return (
    <>
      <Helmet><title>Broadcast — F1 2026 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <SectionHeader title="Live Broadcast" subtitle="Send messages to all connected clients on the /live page" />

        <Card className="mb-8">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter broadcast message..."
              className="flex-1 bg-f1-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-f1-admin/50"
              onKeyDown={(e) => e.key === 'Enter' && send()}
              aria-label="Broadcast message"
            />
            <Button variant="admin" onClick={send} disabled={sending || !message.trim()}>
              {sending ? 'Sending...' : '📡 Send'}
            </Button>
          </div>
        </Card>

        <h3 className="text-lg font-bold text-gray-300 mb-4">Sent History</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {history.map((h, idx) => (
              <motion.div
                key={h.timestamp + idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-f1-card rounded-xl border border-white/5 p-4"
              >
                <p className="text-white">{h.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {history.length === 0 && (
            <div className="text-center text-gray-500 py-8">No broadcasts sent yet this session</div>
          )}
        </div>
      </div>
    </>
  );
}
