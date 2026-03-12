import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSocket } from '../context/SocketContext.jsx';
import { Card, Badge, SectionHeader, Button } from '../components/ui.jsx';

export default function Live() {
  const { isConnected, broadcasts, lastBroadcast, socket } = useSocket();
  const videoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const peerConnection = useRef(null);
  const chatEndRef = useRef(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [hasPip, setHasPip] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

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

    socket.on('chat_history', (history) => {
      setChatMessages(history);
    });

    socket.on('receive_chat', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on('kicked', () => {
      alert('You have been removed from the live stream by the admin.');
      window.location.href = '/';
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
        const incomingStream = event.streams[0];

        const updateVideoSources = () => {
          if (!videoRef.current) return;
          const vTracks = incomingStream.getVideoTracks();
          const aTracks = incomingStream.getAudioTracks();

          if (vTracks.length > 1) {
            setHasPip(true);
            videoRef.current.srcObject = new MediaStream([vTracks[0], ...aTracks]);
            if (pipVideoRef.current) pipVideoRef.current.srcObject = new MediaStream([vTracks[1]]);
            if (pipVideoRef.current) pipVideoRef.current.play().catch(e => console.warn('PiP Autoplay prevented:', e));
          } else {
            setHasPip(false);
            videoRef.current.srcObject = incomingStream;
          }
          videoRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
        };

        updateVideoSources();
        incomingStream.onaddtrack = updateVideoSources;
        incomingStream.onremovetrack = updateVideoSources;
      };

      peerConnection.current.oniceconnectionstatechange = () => {
        console.log('[Viewer] ICE State:', peerConnection.current.iceConnectionState);
        if (peerConnection.current.iceConnectionState === 'disconnected' || peerConnection.current.iceConnectionState === 'failed') {
             console.warn('[Viewer] Connection lost. Attempting to restart.');
             setIsLiveStreamActive(false);
             setHasPip(false);
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
    const viewerName = localStorage.getItem('viewerName') || 'Viewer ' + Math.floor(Math.random() * 1000);
    localStorage.setItem('viewerName', viewerName); // Persist for chat
    socket.emit('watcher', { name: viewerName });

    return () => {
      socket.off('broadcaster');
      socket.off('chat_history');
      socket.off('receive_chat');
      socket.off('kicked');
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
    if (pipVideoRef.current && hasPip) {
      pipVideoRef.current.play();
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    
    const viewerName = localStorage.getItem('viewerName') || 'Viewer ' + Math.floor(Math.random() * 1000);
    
    socket.emit('send_chat', {
      senderName: viewerName,
      message: chatInput.trim(),
      isAdmin: false
    });
    setChatInput('');
  };

  return (
    <>
      <Helmet>
        <title>Live — F1 2026</title>
        <meta name="description" content="Live F1 race updates and broadcasts" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Live Feed" subtitle="Real-time race updates, live video, and community chat" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video & Announcements */}
          <div className="lg:col-span-2 space-y-6">

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
          <div 
            ref={playerContainerRef}
            className="bg-black aspect-video relative flex items-center justify-center rounded-lg border border-white/10 group"
          >
            
            {!isLiveStreamActive && (
              <div className="absolute flex flex-col items-center justify-center text-gray-500 z-10 w-full h-full bg-black/80">
                <span className="text-5xl mb-4 opacity-50">📡</span>
                <p className="text-xl font-bold font-f1 tracking-wider uppercase">Live Stream Offline</p>
                <p className="text-sm mt-2 opacity-70 mb-4">Waiting for admin to start broadcasting...</p>
                <Button variant="outline" size="sm" onClick={() => {
                  const viewerName = localStorage.getItem('viewerName') || 'Viewer ' + Math.floor(Math.random() * 1000);
                  socket?.emit('watcher', { name: viewerName });
                }}>
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

            {/* Viewer PiP Overlay */}
            {hasPip && (
              <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video bg-black rounded-lg border-2 border-white/20 overflow-hidden shadow-2xl z-20">
                <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
            )}

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

            {isLiveStreamActive && (
              <button 
                onClick={toggleFullScreen}
                className="absolute bottom-4 right-4 z-30 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105"
                title="Toggle Fullscreen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </button>
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

          {/* Right Column: Live Chat */}
          <div className="lg:col-span-1">
            <Card className="flex flex-col h-[600px] lg:h-[calc(100vh-8rem)] sticky top-24 p-0 overflow-hidden border-white/10">
              <div className="bg-f1-dark border-b border-white/5 p-4 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="text-xl">💬</span> Live Chat
                </h3>
                <Badge color="gray">{chatMessages.length} Messages</Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm italic">
                    Welcome to the live chat! Be the first to say hello.
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-xs font-bold ${msg.isAdmin ? 'text-f1-red' : 'text-gray-400'}`}>
                          {msg.isAdmin ? '👑 Admin' : msg.senderName}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-sm ${msg.isAdmin ? 'bg-f1-red/20 text-white border border-f1-red/30' : 'bg-white/5 text-gray-200'}`}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-f1-dark border-t border-white/5">
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red/50 transition-colors"
                    maxLength={200}
                  />
                  <Button type="submit" variant="admin" className="px-4" disabled={!chatInput.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
