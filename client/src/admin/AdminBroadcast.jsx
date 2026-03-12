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
  const [pipActive, setPipActive] = useState(false);
  
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoRef = useRef(null);
  const pipVideoRef = useRef(null);

  // LiveKit WebRTC Hooks
  const isStreaming = localParticipant?.isScreenShareEnabled || localParticipant?.isCameraEnabled;

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

  const startStream = async (withPip = false) => {
    try {
      // 1. Publish Screen
      await localParticipant.setScreenShareEnabled(true, { audio: true });

      // 2. Publish Camera
      if (withPip) {
        await localParticipant.setCameraEnabled(true);
        await localParticipant.setMicrophoneEnabled(true);
        setPipActive(true);
      }

      // Tie streams to local video elements for preview & VOD recording
      setTimeout(() => {
        const screenTrack = Array.from(localParticipant.videoTrackPublications.values())
          .find(p => p.source === 'screen_share')?.track;
          
        if (screenTrack && videoRef.current) {
           videoRef.current.srcObject = new MediaStream([screenTrack.mediaStreamTrack]);
        }
        
        if (withPip) {
          const camTrack = Array.from(localParticipant.videoTrackPublications.values())
            .find(p => p.source === 'camera')?.track;
            
          if (camTrack && pipVideoRef.current) {
             pipVideoRef.current.srcObject = new MediaStream([camTrack.mediaStreamTrack]);
          }
        }
      }, 500);

    } catch (error) {
      console.error('Error starting stream.', error);
    }
  };

  const stopStream = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    
    await localParticipant.setScreenShareEnabled(false);
    await localParticipant.setCameraEnabled(false);
    await localParticipant.setMicrophoneEnabled(false);
    
    setPipActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    if (pipVideoRef.current) pipVideoRef.current.srcObject = null;
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
            
            <div className="bg-black/50 aspect-video rounded-lg overflow-hidden border border-white/5 mb-4 relative flex items-center justify-center">
              {!isStreaming && (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-500 p-4 text-center">
                  <span className="text-4xl mb-2">💻</span>
                  <p>Screen sharing is currently off</p>
                </div>
              )}
              {/* Note: We use raw HTML videos for Broadcaster preview since local track linking is tricky */}
              <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`} />
              
              <div className={`absolute bottom-4 right-4 w-1/4 aspect-video bg-black rounded-lg border-2 border-f1-red overflow-hidden shadow-2xl transition-opacity duration-300 ${pipActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                 <Badge color="red" className="absolute top-2 left-2 !text-[10px] px-1.5 py-0.5">CAMERA</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                SFU Transcoding Active
              </div>
              
              <div className="flex gap-3">
                {isStreaming ? (
                  <>
                    <Button variant="outline" className={`border-white/20 ${isRecording ? 'text-white bg-red-600 border-red-500' : 'text-gray-300 hover:bg-white/10'}`} onClick={toggleRecording}>
                      {isRecording ? '⏸ Stop Recording' : '⏺ Record VOD'}
                    </Button>
                    <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={stopStream}>
                      ⏹ Stop Stream
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => startStream(false)}>▶ Screen Only</Button>
                    <Button variant="admin" onClick={() => startStream(true)}>▶ Screen + Camera</Button>
                  </>
                )}
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
