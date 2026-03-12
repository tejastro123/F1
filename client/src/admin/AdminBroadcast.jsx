import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';
import { Card, Button, SectionHeader } from '../components/ui.jsx';
import { useSocket } from '../context/SocketContext.jsx'; // Assuming this exists

export default function AdminBroadcast() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [viewers, setViewers] = useState(0);

  const videoRef = useRef(null);
  const peerConnections = useRef({});
  const { socket } = useSocket();

  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!socket || !streaming) return;

    socket.emit('broadcaster');

    socket.on('watcher', (id) => {
      const peerConnection = new RTCPeerConnection(config);
      peerConnections.current[id] = peerConnection;

      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit('offer', id, peerConnection.localDescription);
        });
        
      setViewers(Object.keys(peerConnections.current).length);
    });

    socket.on('answer', (id, description) => {
      peerConnections.current[id].setRemoteDescription(description);
    });

    socket.on('candidate', (id, candidate) => {
      peerConnections.current[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('disconnectPeer', (id) => {
      if (peerConnections.current[id]) {
        peerConnections.current[id].close();
        delete peerConnections.current[id];
        setViewers(Object.keys(peerConnections.current).length);
      }
    });

    return () => {
      socket.off('watcher');
      socket.off('answer');
      socket.off('candidate');
      socket.off('disconnectPeer');
    };
  }, [socket, streaming]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (error) {
      console.error('Error accessing media devices.', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const stopStream = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    videoRef.current.srcObject = null;
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    
    setStreaming(false);
    setViewers(0);
    if (socket) socket.emit('disconnectPeer', socket.id); // Or a custom event to notify server
  };

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
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <SectionHeader title="Live Broadcast" subtitle="Send messages and live video to all connected clients" />

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Video Streaming Section */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${streaming ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
              Live Video Stream
            </h3>
            
            <div className="bg-black/50 aspect-video rounded-lg overflow-hidden border border-white/5 mb-4 relative flex items-center justify-center">
              {!streaming && (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-500">
                  <span className="text-4xl mb-2">📹</span>
                  <p>Camera is currently off</p>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className={`w-full h-full object-cover ${streaming ? 'opacity-100' : 'opacity-0'}`} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {streaming ? (
                  <span className="text-green-400 font-medium">{viewers} Viewer{viewers !== 1 ? 's' : ''} connected</span>
                ) : (
                  <span>Ready to broadcast</span>
                )}
              </div>
              
              {streaming ? (
                <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={stopStream}>
                  ⏹ Stop Stream
                </Button>
              ) : (
                <Button variant="admin" onClick={startStream}>
                  ▶ Start Camera
                </Button>
              )}
            </div>
          </Card>

          {/* Text Broadcast Section */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Text Announcement</h3>
            <div className="flex flex-col gap-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter global broadcast message..."
                rows={3}
                className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-f1-admin/50 resize-none"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                aria-label="Broadcast message"
              />
              <Button variant="admin" onClick={send} disabled={sending || !message.trim()} className="w-full">
                {sending ? 'Sending...' : '📡 Send Announcement'}
              </Button>
            </div>

            <h4 className="text-sm font-bold text-gray-400 mt-6 mb-3 uppercase tracking-wider">Recent Announcements</h4>
            <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {history.map((h, idx) => (
                  <motion.div
                    key={h.timestamp + idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/30 rounded-lg border border-white/5 p-3"
                  >
                    <p className="text-white text-sm">{h.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(h.timestamp).toLocaleTimeString()}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {history.length === 0 && (
                <div className="text-center text-gray-600 py-4 text-sm">No announcements sent yet</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
