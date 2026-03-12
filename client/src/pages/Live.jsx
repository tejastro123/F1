import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LiveKitRoom, 
  VideoTrack,
  useTracks,
  useDataChannel,
  RoomAudioRenderer,
  StartAudio
} from '@livekit/components-react';
import { Track, VideoQuality } from 'livekit-client';
import '@livekit/components-styles';

import api from '../services/api.js';
import { useSocket } from '../context/SocketContext.jsx';
import { Card, Badge, SectionHeader, Button } from '../components/ui.jsx';

export default function Live() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [viewerName] = useState(() => localStorage.getItem('viewerName') || 'Viewer ' + Math.floor(Math.random() * 1000));
  
  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

  useEffect(() => {
    localStorage.setItem('viewerName', viewerName);
    
    const fetchToken = async () => {
      try {
        const { data } = await api.post('/stream/token', {
          roomName: 'f1-live-stream',
          role: 'viewer',
          participantName: viewerName
        });
        setToken(data.token);
      } catch (err) {
        console.error('Failed to get viewer token', err);
        setError('Could not connect to the streaming server. Admin may be offline.');
      }
    };
    fetchToken();
  }, [viewerName]);

  if (error) return <div className="pt-32 px-4 text-center text-red-500 max-w-2xl mx-auto"><Card>{error}</Card></div>;
  if (!token) return <div className="pt-32 text-center text-gray-400">Connecting to global stream edge network...</div>;
  if (!livekitUrl) return <div className="pt-32 text-center text-red-400">VITE_LIVEKIT_URL missing in environment</div>;

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      className="lk-room-container"
    >
      <LiveViewerContent viewerName={viewerName} />
      <RoomAudioRenderer />
      
      {/* LiveKit component that only renders if the browser blocks AudioContext autoplay */}
      <StartAudio label="Click to allow audio & play stream" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm text-white font-bold text-xl uppercase tracking-widest cursor-pointer hover:bg-black/95 transition-all text-f1-red border-4 border-f1-red" />
    </LiveKitRoom>
  );
}

function LiveViewerContent({ viewerName }) {
  const { broadcasts, lastBroadcast } = useSocket();
  const playerContainerRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // VOD & Quality State
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState('high');
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  
  // Use LiveKit hooks to find any tracks published by the Admin (Screen + Camera)
  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
    { source: Track.Source.Camera, withPlaceholder: false }
  ]);
  
  const audioTracks = useTracks([
    { source: Track.Source.Microphone, withPlaceholder: false },
    { source: Track.Source.ScreenShareAudio, withPlaceholder: false }
  ]);
  
  const screenTrack = tracks.find(t => t.source === Track.Source.ScreenShare);
  const camTrack = tracks.find(t => t.source === Track.Source.Camera);
  const isLiveStreamActive = tracks.length > 0;

  // Listen for admin chat messages
  const { send: sendData } = useDataChannel('chat', (msg) => {
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
    if (!chatInput.trim()) return;
    
    const chatData = {
      id: Math.random().toString(),
      senderName: viewerName,
      message: chatInput.trim(),
      isAdmin: false,
      timestamp: new Date().toISOString()
    };
    
    const payload = new TextEncoder().encode(JSON.stringify(chatData));
    sendData(payload, { topic: 'chat' });
    
    setChatMessages(prev => [...prev, chatData]);
    setChatInput('');
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

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const tracksToRecord = [];
      
      if (screenTrack?.publication?.track?.mediaStreamTrack) {
        tracksToRecord.push(screenTrack.publication.track.mediaStreamTrack);
      }
      if (camTrack?.publication?.track?.mediaStreamTrack) {
        tracksToRecord.push(camTrack.publication.track.mediaStreamTrack);
      }
      
      audioTracks.forEach(t => {
        if (t.publication?.track?.mediaStreamTrack) {
          tracksToRecord.push(t.publication.track.mediaStreamTrack);
        }
      });
      
      if (tracksToRecord.length === 0) return alert('No active stream to record.');
      
      const finalStream = new MediaStream(tracksToRecord);
      recordedChunks.current = [];
      
      try {
        const mediaRecorder = new MediaRecorder(finalStream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.current.push(event.data);
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

  const handleQualityChange = (e) => {
    const newQuality = e.target.value;
    setQuality(newQuality);
    
    let lkQuality = VideoQuality.HIGH;
    if (newQuality === 'medium') lkQuality = VideoQuality.MEDIUM;
    if (newQuality === 'low') lkQuality = VideoQuality.LOW;
    
    if (screenTrack?.publication) {
      screenTrack.publication.setVideoQuality(lkQuality);
    }
    if (camTrack?.publication) {
      camTrack.publication.setVideoQuality(lkQuality);
    }
  };

  return (
    <>
      <Helmet>
        <title>Live — F1 2026</title>
        <meta name="description" content="Live F1 race updates and broadcasts" />
      </Helmet>

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Live Edge Feed" subtitle="Zero-latency sub-second global streaming" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video & Announcements */}
          <div className="lg:col-span-2 space-y-6">

            {/* Connection Status */}
            <Card className="mb-6 flex justify-between items-center bg-black/40 border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-live-pulse" />
                <span className="font-medium text-gray-300">Edge Server: Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-300">LiveKit Stream:</span>
                <Badge color={isLiveStreamActive ? 'red' : 'gray'}>{isLiveStreamActive ? 'LIVE' : 'OFFLINE'}</Badge>
              </div>
            </Card>

            {/* Viewer Stream Controls */}
            {isLiveStreamActive && (
              <div className="flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Stream Quality:</span>
                  <select 
                    value={quality}
                    onChange={handleQualityChange}
                    className="bg-black/80 border border-white/20 rounded px-2 py-1 text-white text-sm outline-none cursor-pointer focus:border-red-500 transition-colors"
                  >
                    <option value="high">1080p (Source)</option>
                    <option value="medium">720p (Data Saver)</option>
                    <option value="low">480p (Low Bandwidth)</option>
                  </select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`border-white/20 ${isRecording ? 'text-white bg-red-600 border-red-500 animate-pulse' : 'text-gray-300 hover:bg-white/10'}`} 
                  onClick={toggleRecording}
                >
                  {isRecording ? '⏸ Stop Recording' : '⏺ Record VOD'}
                </Button>
              </div>
            )}

            {/* Live Video Player */}
            <Card className={`mb-8 p-0 overflow-hidden transition-all duration-500 ${isLiveStreamActive ? 'ring-2 ring-red-500/50' : 'opacity-80'}`}>
              <div 
                ref={playerContainerRef}
                className="bg-black aspect-video relative flex items-center justify-center rounded-lg border border-white/10 group"
              >
                {!isLiveStreamActive && (
                  <div className="absolute flex flex-col items-center justify-center text-gray-500 z-10 w-full h-full bg-black/80">
                    <span className="text-5xl mb-4 opacity-50">📡</span>
                    <p className="text-xl font-bold font-f1 tracking-wider uppercase">Live Stream Offline</p>
                    <p className="text-sm mt-2 opacity-70 mb-4">Waiting for admin to start broadcasting...</p>
                  </div>
                )}

                {/* LiveKit automatically handles Track rendering and attaching streams to <video> tags */}
                {screenTrack && (
                   <VideoTrack trackRef={screenTrack} className="w-full h-full object-cover rounded-lg" />
                )}

                {/* Viewer PiP Overlay */}
                {camTrack && (
                  <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video bg-black rounded-lg border-2 border-white/20 overflow-hidden shadow-2xl z-20">
                    <VideoTrack trackRef={camTrack} className="w-full h-full object-cover" />
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
                    className="absolute bottom-4 left-4 z-30 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-lg backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
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
                  <span className="text-xl">💬</span> LiveKit Chat
                </h3>
                <Badge color="gray">{chatMessages.length} Messages</Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm italic">
                    Welcome to the global edge network chat!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex flex-col `}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-xs font-bold ${msg.isAdmin ? 'text-f1-red' : 'text-gray-400'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-sm inline-block max-w-[90%] ${msg.isAdmin ? 'bg-f1-red/20 text-white border border-f1-red/30' : 'bg-white/5 text-gray-200'}`}>
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
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
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
