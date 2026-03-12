import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';
import { Card, Button, SectionHeader, Badge } from '../components/ui.jsx';
import { 
  LiveKitRoom, 
  useRoomContext,
  useLocalParticipant,
  useDataChannel,
  TrackToggle,
} from '@livekit/components-react';
import '@livekit/components-styles';

// Container component that fetches the LiveKit Token
export default function AdminBroadcast() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  
  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await api.post('/stream/token', {
          roomName: 'f1-live-stream',
          role: 'admin',
          participantName: 'Admin Broadcaster'
        });
        setToken(data.token);
      } catch (err) {
        console.error('Failed to get token', err);
        setError('Could not connect to the streaming server.');
      }
    };
    fetchToken();
  }, []);

  if (error) return <div className="pt-32 text-center text-red-500">{error}</div>;
  if (!token) return <div className="pt-32 text-center text-gray-400">Connecting to stream server...</div>;
  if (!livekitUrl) return <div className="pt-32 text-center text-red-400">VITE_LIVEKIT_URL is missing in .env</div>;

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      className="lk-room-container"
    >
      <AdminBroadcastContent />
    </LiveKitRoom>
  );
}

// Inner Component with access to LiveKit Room hooks
function AdminBroadcastContent() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoRef = useRef(null);
  const pipVideoRef = useRef(null);

  // Multi-Viewpoint State
  const [viewpoints, setViewpoints] = useState([
    { id: 'main', label: 'Main Feed', active: false, source: 'screen_share' },
    { id: 'onboard1', label: 'Onboard 1', active: false, source: 'camera' },
    { id: 'pitlane', label: 'Pit Lane', active: false, source: 'camera' },
    { id: 'data', label: 'Telemetry', active: false, source: 'screen_share' }
  ]);

  const toggleViewpoint = async (viewId) => {
    const vp = viewpoints.find(v => v.id === viewId);
    if (!vp) return;

    try {
      if (vp.active) {
        // Stop specific track
        if (vp.source === 'screen_share') {
           await localParticipant.setScreenShareEnabled(false);
        } else {
           await localParticipant.setCameraEnabled(false);
        }
        setViewpoints(prev => prev.map(v => v.id === viewId ? { ...v, active: false } : v));
      } else {
        // Start specific track
        if (vp.source === 'screen_share') {
           await localParticipant.setScreenShareEnabled(true, { 
             audio: false,
             name: vp.label // Label the track for users
           });
        } else {
           await localParticipant.setCameraEnabled(true, {
             name: vp.label
           });
        }
        setViewpoints(prev => prev.map(v => v.id === viewId ? { ...v, active: true } : v));
      }
    } catch (err) {
      console.error('Failed to toggle viewpoint', err);
    }
  };

  const isStreaming = viewpoints.some(v => v.active);

  // Listen to incoming chat messages from DataChannel
  useDataChannel('chat', (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload));
      setChatMessages(prev => [...prev, data]);
    } catch (e) { console.error('Error decoding chat', e); }
  });

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !room) return;
    
    const chatData = {
      id: Math.random().toString(),
      senderName: '👑 Admin',
      message: chatInput.trim(),
      isAdmin: true,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast chat internally via LiveKit DataChannel
    const payload = new TextEncoder().encode(JSON.stringify(chatData));
    room.localParticipant.publishData(payload, { topic: 'chat' });
    
    // Self-display
    setChatMessages(prev => [...prev, chatData]);
    setChatInput('');
  };

  const stopAllStreams = async () => {
    await localParticipant.setScreenShareEnabled(false);
    await localParticipant.setCameraEnabled(false);
    await localParticipant.setMicrophoneEnabled(false);
    setViewpoints(prev => prev.map(v => ({ ...v, active: false })));
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const screenStream = videoRef.current?.srcObject;
      const camStream = pipVideoRef.current?.srcObject;
      
      if (!screenStream) return alert('Start a stream first to record.');
      
      let finalStream = screenStream;
      if (camStream) {
        finalStream = new MediaStream([
          ...screenStream.getTracks(),
          ...camStream.getTracks()
        ]);
      }
      
      recordedChunks.current = [];
      const options = { mimeType: 'video/webm' };
      try {
        const mediaRecorder = new MediaRecorder(finalStream, options);
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
           a.href = url;
           a.download = `f1-live-vod-${new Date().toISOString()}.webm`;
           a.click();
           URL.revokeObjectURL(url);
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Error recording', e);
        alert('Browser does not support VOD capture of this stream.');
      }
    }
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
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="LiveKit Broadcast" subtitle="Powered by high-performance SFU infrastructure" />

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Video Streaming Section */}
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
              Live Video Stream
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {viewpoints.map(vp => (
                  <button
                    key={vp.id}
                    onClick={() => toggleViewpoint(vp.id)}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                      vp.active 
                        ? 'bg-f1-red/10 border-f1-red text-white shadow-[0_0_20px_rgba(225,6,0,0.2)]' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl">{vp.source === 'screen_share' ? '🖥️' : '🎥'}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{vp.label}</span>
                    <Badge color={vp.active ? 'red' : 'gray'}>{vp.active ? 'BROADCASTING' : 'OFFLINE'}</Badge>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-sm text-gray-400">
                  Click a viewpoint to toggle live transmission
                </div>
                <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={stopAllStreams}>
                  ⏹ Emergency Stop All
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Column: Text Announcements & Live Chat */}
          <div className="lg:col-span-1 space-y-8 flex flex-col">
            
            {/* Live Chat Section */}
            <Card className="flex flex-col flex-1 min-h-[400px] p-0 overflow-hidden border-white/10">
              <div className="bg-f1-dark border-b border-white/5 p-4 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="text-xl">💬</span> LiveKit Chat
                </h3>
                <Badge color={chatMessages.length > 0 ? 'red' : 'gray'}>{chatMessages.length} Messages</Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm italic">Chat channel open...</div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-xs font-bold ${msg.isAdmin ? 'text-f1-red' : 'text-gray-400'}`}>
                          {msg.senderName}
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
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    maxLength={200}
                  />
                  <Button type="submit" variant="admin" className="px-4" disabled={!chatInput.trim()}>Send</Button>
                </form>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-white mb-4">Global Network Alert</h3>
              <div className="flex flex-col gap-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Push message to all database clients..."
                  rows={2}
                  className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none resize-none"
                />
                <Button variant="admin" onClick={send} disabled={sending || !message.trim()} className="w-full">
                  📡 Dispatch
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
