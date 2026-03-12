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

// Live Center Components
import ReactionStream from '../components/Live/ReactionStream.jsx';
import PollWidget from '../components/Live/PollWidget.jsx';
import TrackStatusPanel from '../components/Live/TrackStatusPanel.jsx';
import SectorFeed from '../components/Live/SectorFeed.jsx';
import PredictionHeatmap from '../components/Live/PredictionHeatmap.jsx';

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
      <ReactionStream />
      <div className="pt-24 pb-16 px-4 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader title="Live Command Center" subtitle="Zero-latency sub-second global streaming & interactive telemetry" className="!mb-0" />
          <div className="hidden sm:flex gap-2">
            <Badge color={isLiveStreamActive ? 'red' : 'gray'} className="animate-live-pulse">
              {isLiveStreamActive ? 'Race Session Active' : 'Waiting for Broadcast'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Telemetry & Commentary */}
          <div className="lg:col-span-1 space-y-6">
            <TrackStatusPanel />
            <SectorFeed />
          </div>

          {/* Middle: Live Stream & Interaction */}
          <div className="lg:col-span-2 space-y-6">
             {/* Connection Status */}
             <Card className="flex justify-between items-center bg-black/40 border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-live-pulse" />
                <span className="font-medium text-[10px] uppercase tracking-widest text-gray-400">Edge Connectivity: Optimized</span>
              </div>
              {isLiveStreamActive && (
                <div className="flex items-center gap-3">
                  <select 
                    value={quality}
                    onChange={handleQualityChange}
                    className="bg-black/80 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white outline-none cursor-pointer focus:border-red-500 transition-colors"
                  >
                    <option value="high">1080p</option>
                    <option value="medium">720p</option>
                    <option value="low">480p</option>
                  </select>
                </div>
              )}
            </Card>

            {/* Live Video Player */}
            <Card className={`relative p-0 overflow-hidden transition-all duration-500 rounded-3xl ${isLiveStreamActive ? 'ring-2 ring-red-500/50 shadow-[0_0_40px_rgba(255,0,0,0.1)]' : 'opacity-80'}`}>
              <div 
                ref={playerContainerRef}
                className="bg-black aspect-video relative flex items-center justify-center group"
              >
                {!isLiveStreamActive && (
                  <div className="absolute flex flex-col items-center justify-center text-gray-500 z-10 w-full h-full bg-black/80">
                    <span className="text-5xl mb-4 opacity-50">📡</span>
                    <p className="text-xl font-bold font-f1 tracking-wider uppercase">Live Stream Offline</p>
                    <p className="text-sm mt-2 opacity-70 mb-4 text-center px-4">The command center is powered up. Waiting for the session to go green.</p>
                  </div>
                )}

                {screenTrack && (
                   <VideoTrack trackRef={screenTrack} className="w-full h-full object-contain" />
                )}

                {camTrack && (
                  <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video bg-black rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl z-20">
                    <VideoTrack trackRef={camTrack} className="w-full h-full object-cover" />
                  </div>
                )}
                
                {isLiveStreamActive && (
                  <div className="absolute top-4 left-4 z-10">
                    <button onClick={toggleFullScreen} className="bg-black/40 hover:bg-black/60 p-2 rounded-lg backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 00 2-2v-3M3 16v3a2 2 0 00 2 2h3" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <PollWidget />
              <PredictionHeatmap round={20} />
            </div>
          </div>

          {/* Right: Global Chat */}
          <div className="lg:col-span-1">
            <Card className="flex flex-col h-[600px] lg:h-[calc(100vh-14rem)] sticky top-24 p-0 overflow-hidden border-white/5 bg-white/5 backdrop-blur-md">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> Live Comms
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-20 text-xs italic">
                    Encrypted channel established.
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${msg.isAdmin ? 'text-f1-red' : 'text-f1-gold'}`}>
                          {msg.senderName}
                        </span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className={`px-3 py-2 rounded-xl text-sm ${msg.isAdmin ? 'bg-f1-red/10 text-white border border-f1-red/20' : 'bg-white/5 text-gray-200'}`}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-white/5">
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Broadcast message..."
                    className="flex-1 bg-f1-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                    maxLength={200}
                  />
                  <button type="submit" className="p-2 bg-f1-red text-white rounded-xl hover:bg-red-600 transition-colors" disabled={!chatInput.trim()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
