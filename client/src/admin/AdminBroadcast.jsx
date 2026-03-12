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
  const [viewerList, setViewerList] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [pipActive, setPipActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState('1080p');

  const videoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const peerConnections = useRef({});
  const { socket } = useSocket();

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

    socket.on('chat_history', (history) => setChatMessages(history));
    socket.on('receive_chat', (msg) => setChatMessages(prev => [...prev, msg]));
    socket.on('viewer_list', (list) => {
      setViewerList(list);
      setViewers(list.length);
    });

    return () => {
      socket.off('chat_history');
      socket.off('receive_chat');
      socket.off('viewer_list');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !streaming) return;

    socket.emit('broadcaster');

    socket.on('watcher', (id) => {
      const peerConnection = new RTCPeerConnection(config);
      peerConnections.current[id] = peerConnection;

      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => {
        const sender = peerConnection.addTrack(track, stream);
        
        // Apply initial quality settings to video tracks
        if (track.kind === 'video') {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          
          if (quality === '480p') {
            params.encodings[0].maxBitrate = 500000;
            params.encodings[0].scaleResolutionDownBy = 2.0;
          } else if (quality === '720p') {
            params.encodings[0].maxBitrate = 1500000;
            params.encodings[0].scaleResolutionDownBy = 1.5;
          } else {
            params.encodings[0].maxBitrate = 3000000;
            params.encodings[0].scaleResolutionDownBy = 1.0;
          }
          sender.setParameters(params).catch(e => console.warn('Could not set initial encode params:', e));
        }
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${id}`);
          socket.emit('candidate', id, event.candidate);
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(`[Broadcaster] ICE State for ${id}:`, peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed') {
          console.warn(`Peer ${id} disconnected unexpectedly. Closing connection.`);
          peerConnection.close();
          delete peerConnections.current[id];
          setViewers(Object.keys(peerConnections.current).length);
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
      console.log(`Received answer from ${id}`);
      peerConnections.current[id]?.setRemoteDescription(description).catch(e => console.error('Error setting remote description:', e));
    });

    socket.on('candidate', (id, candidate) => {
      console.log(`Received candidate from ${id}`);
      peerConnections.current[id]?.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error('Error adding candidate:', e));
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

  const startStream = async (withPip = false) => {
    try {
      // 1. Request Screen Share
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: 'always' }, 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100
        } 
      });

      let finalStream = screenStream;

      // 2. Request Webcam if PiP is enabled
      if (withPip) {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          pipVideoRef.current.srcObject = cameraStream;
          setPipActive(true);
          
          // Combine all tracks into a single outgoing stream
          finalStream = new MediaStream([
            ...screenStream.getVideoTracks(),  // Track 0: Screen
            ...cameraStream.getVideoTracks(),  // Track 1: Webcam
            ...screenStream.getAudioTracks(),  // Optional: System Audio
            ...cameraStream.getAudioTracks()   // Optional: Mic Audio
          ]);
        } catch (camErr) {
          console.error('Camera PiP failed', camErr);
          alert('Could not access camera for PiP. Broadcasting screen only.');
        }
      }

      // Stop the stream if the user clicks "Stop Sharing" on the browser's native banner
      screenStream.getVideoTracks()[0].onended = () => {
        stopStream();
      };

      videoRef.current.srcObject = finalStream;
      setStreaming(true);
    } catch (error) {
      console.error('Error accessing screen sharing.', error);
      if (error.name !== 'NotAllowedError') { // Don't alert if they just clicked cancel
        alert('Could not access screen sharing. Ensure permissions are granted.');
      }
    }
  };

  const stopStream = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    const pipStream = pipVideoRef.current?.srcObject;
    if (pipStream) {
      pipStream.getTracks().forEach(track => track.stop());
    }
    
    videoRef.current.srcObject = null;
    if (pipVideoRef.current) pipVideoRef.current.srcObject = null;
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    
    setStreaming(false);
    setPipActive(false);
    setViewers(0);
    setViewerList([]);
    if (socket) socket.emit('disconnectPeer', socket.id); // Or a custom event to notify server
  };

  const kickViewer = (id) => {
    if (socket && window.confirm('Are you sure you want to kick this viewer?')) {
      socket.emit('kick_viewer', id);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const stream = videoRef.current?.srcObject;
      if (!stream) return alert('Start a stream first to record.');
      
      recordedChunks.current = [];
      const options = { mimeType: 'video/webm' };
      try {
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style = 'display: none';
          a.href = url;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          a.download = `f1-live-vod-${timestamp}.webm`;
          a.click();
          window.URL.revokeObjectURL(url);
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Error starting recording', e);
        alert('Recording feature is not supported in this browser for this stream type.');
      }
    }
  };

  const handleQualityChange = async (newQuality) => {
    setQuality(newQuality);
    
    let maxBitrate = 3000000;
    let scale = 1.0;
    
    if (newQuality === '480p') {
      maxBitrate = 500000;
      scale = 2.0;
    } else if (newQuality === '720p') {
      maxBitrate = 1500000;
      scale = 1.5;
    }

    Object.values(peerConnections.current).forEach(async (pc) => {
      const senders = pc.getSenders();
      const videoSenders = senders.filter(s => s.track && s.track.kind === 'video');
      
      for (const sender of videoSenders) {
        const params = sender.getParameters();
        if (!params.encodings) params.encodings = [{}];
        params.encodings[0].maxBitrate = maxBitrate;
        params.encodings[0].scaleResolutionDownBy = scale;
        try {
          await sender.setParameters(params);
        } catch (e) {
          console.error('Error applying dynamic quality settings', e);
        }
      }
    });
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    
    socket.emit('send_chat', {
      senderName: 'Admin',
      message: chatInput.trim(),
      isAdmin: true
    });
    setChatInput('');
  };

  return (
    <>
      <Helmet><title>Broadcast — F1 2026 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Live Broadcast" subtitle="Send messages, manage live video, and interact with viewers" />

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Video Streaming Section */}
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${streaming ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
              Live Video Stream
            </h3>
            
            <div className="bg-black/50 aspect-video rounded-lg overflow-hidden border border-white/5 mb-4 relative flex items-center justify-center">
              {!streaming && (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-500 p-4 text-center">
                  <span className="text-4xl mb-2">💻</span>
                  <p>Screen sharing is currently off</p>
                  <p className="text-xs mt-2 text-gray-600">Tip: Check "Share system audio" when prompted to include sound</p>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className={`w-full h-full object-cover ${streaming ? 'opacity-100' : 'opacity-0'}`} 
              />
              {/* Local PiP Preview */}
              <div className={`absolute bottom-4 right-4 w-1/4 aspect-video bg-black rounded-lg border-2 border-f1-red overflow-hidden shadow-2xl transition-opacity duration-300 ${pipActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                 <Badge color="red" className="absolute top-2 left-2 !text-[10px] px-1.5 py-0.5">CAMERA</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {streaming ? (
                  <span className="text-green-400 font-medium">{viewers} Viewer{viewers !== 1 ? 's' : ''} connected</span>
                ) : (
                  <span>Ready to broadcast</span>
                )}
                
                <select 
                  value={quality}
                  onChange={(e) => handleQualityChange(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs outline-none cursor-pointer hover:border-white/20 transition-colors"
                  title="Adjust stream bandwidth"
                >
                   <option value="1080p">1080p (High)</option>
                   <option value="720p">720p (Med)</option>
                   <option value="480p">480p (Low/Saver)</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                {streaming ? (
                  <>
                    <Button variant="outline" className={`border-white/20 transition-all ${isRecording ? 'text-white bg-red-600 hover:bg-red-700 border-red-500' : 'text-gray-300 hover:bg-white/10'}`} onClick={toggleRecording}>
                      {isRecording ? '⏸ Stop Recording' : '⏺ Record VOD'}
                    </Button>
                    <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={stopStream}>
                      ⏹ Stop Stream
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => startStream(false)}>
                      ▶ Screen Only
                    </Button>
                    <Button variant="admin" onClick={() => startStream(true)}>
                      ▶ Screen + Camera
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Right Column: Text Announcements & Live Chat */}
          <div className="lg:col-span-1 space-y-8 flex flex-col">
            
            {/* Text Broadcast Section */}
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">Global Announcement</h3>
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

          {/* Live Chat Section */}
          <Card className="flex flex-col flex-1 min-h-[400px] p-0 overflow-hidden border-white/10">
            <div className="bg-f1-dark border-b border-white/5 p-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-xl">💬</span> Live Chat
              </h3>
              <Badge color={chatMessages.length > 0 ? 'red' : 'gray'}>{chatMessages.length} Messages</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm italic">
                  Chat goes here...
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-xs font-bold ${msg.isAdmin ? 'text-f1-red' : 'text-gray-400'}`}>
                        {msg.isAdmin ? '👑 Admin' : msg.senderName}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${msg.isAdmin ? 'bg-f1-red/20 text-white border border-f1-red/30' : 'bg-white/5 text-gray-200'}`}>
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
                  placeholder="Send as Admin..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-red/50 transition-colors"
                  maxLength={200}
                />
                <Button type="submit" variant="admin" className="px-4" disabled={!chatInput.trim()}>
                  Send
                </Button>
              </form>
            </div>
          </Card>
          
          {/* Moderation Section */}
          <Card className="flex flex-col min-h-[300px] p-0 overflow-hidden border-white/10">
            <div className="bg-f1-dark border-b border-white/5 p-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-xl">🛡️</span> Connected Viewers
              </h3>
              <Badge color={viewers > 0 ? 'green' : 'gray'}>{viewers} Watching</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/20">
              {viewerList.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm italic">
                  No active viewers
                </div>
              ) : (
                viewerList.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{v.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Joined: {new Date(v.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => kickViewer(v.id)}
                      className="text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white px-3 py-1 text-xs"
                    >
                      Kick
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          </div>
        </div>
      </div>
    </>
  );
}
