import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSocket } from '../context/SocketContext.jsx';
import { Card, Badge, SectionHeader, Button } from '../components/ui.jsx';

export default function Live() {
  const { isConnected, broadcasts, lastBroadcast, socket } = useSocket();
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { 
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      { 
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      { 
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('broadcaster', () => {
      console.log('Broadcaster is active! Requesting to watch...');
      socket.emit('watcher');
    });

    socket.on('offer', (id, description) => {
      peerConnection.current = new RTCPeerConnection(config);
      
      peerConnection.current
        .setRemoteDescription(description)
        .then(() => peerConnection.current.createAnswer())
        .then((sdp) => peerConnection.current.setLocalDescription(sdp))
        .then(() => {
          socket.emit('answer', id, peerConnection.current.localDescription);
        });

      peerConnection.current.ontrack = (event) => {
        console.log('[Viewer] Track received:', event.track.kind, event.streams);
        setIsLiveStreamActive(true);
        if (videoRef.current) {
          if (videoRef.current.srcObject !== event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
          }
          videoRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
        }
      };

      peerConnection.current.oniceconnectionstatechange = () => {
        console.log('[Viewer] ICE State:', peerConnection.current.iceConnectionState);
        if (peerConnection.current.iceConnectionState === 'disconnected' || peerConnection.current.iceConnectionState === 'failed') {
             console.warn('[Viewer] Connection lost. Attempting to restart.');
             setIsLiveStreamActive(false);
             if (videoRef.current) videoRef.current.srcObject = null;
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[Viewer] Sending ICE candidate back to broadcaster');
          socket.emit('candidate', id, event.candidate);
        }
      };
    });

    socket.on('candidate', (id, candidate) => {
      console.log('[Viewer] Received ICE candidate from broadcaster');
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error('[Viewer] Error adding candidate:', e));
      }
    });

    socket.on('disconnectPeer', () => {
      console.log('Broadcaster disconnected.');
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      setIsLiveStreamActive(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    });

    window.onunload = window.onbeforeunload = () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      socket.close();
    };

    // When first mounting, ask if there is an active broadcaster
    console.log('Emitting watcher request...');
    socket.emit('watcher');

    return () => {
      socket.off('broadcaster');
      socket.off('offer');
      socket.off('candidate');
      socket.off('disconnectPeer');
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [socket]);

  // Browsers often block autoplaying video with sound until the user interacts with the page
  const handlePlayClick = () => {
    setUserInteracted(true);
    if (videoRef.current && isLiveStreamActive) {
      videoRef.current.play();
      videoRef.current.muted = false; // Unmute on explicit play
    }
  };

  return (
    <>
      <Helmet>
        <title>Live — F1 2026</title>
        <meta name="description" content="Live F1 race updates and broadcasts" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <SectionHeader title="Live Feed" subtitle="Real-time race updates and live video broadcast" />

        {/* Connection Status */}
        <Card className="mb-6 flex justify-between items-center bg-black/40 border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-live-pulse' : 'bg-red-500'}`} />
            <span className="font-medium text-gray-300">Server: {isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-300">Video Stream:</span>
            <Badge color={isLiveStreamActive ? 'red' : 'gray'}>{isLiveStreamActive ? 'LIVE' : 'OFFLINE'}</Badge>
          </div>
        </Card>

        {/* Live Video Player */}
        <Card className={`mb-8 overflow-hidden transition-all duration-500 ${isLiveStreamActive ? 'ring-2 ring-red-500/50' : 'opacity-80'}`}>
          <div className="bg-black aspect-video relative flex items-center justify-center rounded-lg border border-white/10 group">
            
            {!isLiveStreamActive && (
              <div className="absolute flex flex-col items-center justify-center text-gray-500 z-10 w-full h-full bg-black/80">
                <span className="text-5xl mb-4 opacity-50">📡</span>
                <p className="text-xl font-bold font-f1 tracking-wider uppercase">Live Stream Offline</p>
                <p className="text-sm mt-2 opacity-70 mb-4">Waiting for admin to start broadcasting...</p>
                <Button variant="outline" size="sm" onClick={() => socket?.emit('watcher')}>
                  Refresh Connection
                </Button>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              webkit-playsinline="true"
              muted // Start muted to bypass initial autoplay restrictions
              className={`w-full h-full object-cover rounded-lg ${!isLiveStreamActive ? 'hidden' : ''}`}
            />

            {/* Play Overlay (for unmuting/interaction policy) */}
            {isLiveStreamActive && !userInteracted && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-20 backdrop-blur-sm">
                <Button variant="admin" size="lg" onClick={handlePlayClick} className="shadow-2xl shadow-red-500/20">
                  <span className="text-xl mr-2">🔊</span> Tap to Unmute & Play
                </Button>
              </div>
            )}
            
            {isLiveStreamActive && (
              <div className="absolute top-4 left-4 z-10">
                <Badge color="red" className="animate-live-pulse bg-red-600/80 backdrop-blur border-red-400">
                  <span className="w-2 h-2 rounded-full bg-white mr-2 inline-block animate-pulse"></span>
                  LIVE
                </Badge>
              </div>
            )}
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
              <span className="text-f1-red text-sm font-bold uppercase">Latest Announcement</span>
            </div>
            <p className="text-xl font-bold text-white">{lastBroadcast.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(lastBroadcast.timestamp).toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* Broadcast History */}
        <h3 className="text-lg font-bold mb-4 text-gray-300">Announcement History</h3>
        {broadcasts.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3 opacity-50">📰</div>
            <p className="text-gray-400">No announcements yet</p>
            <p className="text-gray-500 text-sm mt-1">Updates will appear here when your admin sends a message</p>
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
