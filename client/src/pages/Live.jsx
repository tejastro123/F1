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
import AdvancedPlayer from '../components/Live/AdvancedPlayer.jsx';

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

  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // VOD & Quality State
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState('high');
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  
  // Discover ALL tracks (Camera & ScreenShare)
  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
    { source: Track.Source.Camera, withPlaceholder: false }
  ]);
  
  const [activeTrackId, setActiveTrackId] = useState(null);

  // Auto-select first track if none selected
  useEffect(() => {
    if (tracks.length > 0 && !activeTrackId) {
      setActiveTrackId(tracks[0].publication.trackSid);
    }
  }, [tracks, activeTrackId]);

  const audioTracks = useTracks([
    { source: Track.Source.Microphone, withPlaceholder: false },
    { source: Track.Source.ScreenShareAudio, withPlaceholder: false }
  ]);
  
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

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 150);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <ReactionStream />
      <div className="pt-20 md:pt-28 pb-16 px-4 max-w-[1600px] mx-auto overflow-x-hidden">
        {/* Header - Hidden on small mobile to save space when scrolling */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-2">
          <SectionHeader 
            title="Live Center" 
            subtitle="Real-time race telemetry & global broadcast" 
            className="!mb-0" 
          />
          <Badge color={isLiveStreamActive ? 'red' : 'gray'} className="animate-live-pulse px-4 py-2">
            {isLiveStreamActive ? 'Track Status: GREEN' : 'Waiting for telemetry'}
          </Badge>
        </div>

        <div className={`grid grid-cols-1 gap-6 lg:gap-8 items-start transition-all duration-500 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-4'}`}>
          
          {/* Main Content Area - Video & Primary Interactions */}
          <div className={`${isTheaterMode ? 'lg:col-span-1' : 'lg:col-span-2'} order-1 lg:order-2 space-y-6`}>
             
             {/* Sticky Video Container */}
             <div className={`transition-all duration-500 z-40 ${isSticky && !isTheaterMode ? 'fixed top-16 left-0 right-0 px-0 md:relative md:top-0 md:px-0' : 'relative'}`}>
               <Card 
                  className={`p-0 overflow-hidden transition-all duration-500 ${
                    isSticky && !isTheaterMode ? 'rounded-none border-b border-white/10 shadow-2xl' : 'rounded-[2rem] md:rounded-[3rem] border-white/5 ring-1 ring-white/10'
                  } ${isLiveStreamActive ? 'shadow-[0_0_50px_rgba(255,0,0,0.15)]' : ''} ${isTheaterMode ? 'aspect-[21/9] max-h-[80vh]' : 'aspect-video'}`}
                  glass={!isSticky || isTheaterMode}
                  hover={!isSticky && !isTheaterMode}
                >
                <div 
                  ref={playerContainerRef}
                  className={`bg-black w-full h-full relative flex items-center justify-center group`}
                >
                  {isLiveStreamActive ? (
                     <AdvancedPlayer 
                        tracks={tracks}
                        activeTrackId={activeTrackId}
                        onSelectTrack={setActiveTrackId}
                        isLive={isLiveStreamActive} 
                        isTheaterMode={isTheaterMode}
                        onTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
                        onQualityChange={(q) => {
                           let lkQuality = VideoQuality.HIGH;
                           if (q === 'medium') lkQuality = VideoQuality.MEDIUM;
                           if (q === 'low') lkQuality = VideoQuality.LOW;
                           tracks.forEach(t => t.publication?.setVideoQuality(lkQuality));
                        }}
                     />
                  ) : (
                    <div className="absolute flex flex-col items-center justify-center text-gray-500 z-10 w-full h-full bg-black/80 backdrop-blur-sm">
                      <motion.span 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4 opacity-30"
                      >📡</motion.span>
                      <p className="text-xl font-black tracking-tighter uppercase italic text-white/40">Telemetry Offline</p>
                    </div>
                  )}

                  {/* Mobile Scroll Indicator for Sticky */}
                  {isSticky && (
                    <div className="absolute top-2 right-4 md:hidden">
                      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[10px] font-black text-white/50 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full backdrop-blur-md">Scroll to top ↑</button>
                    </div>
                  )}
                </div>
              </Card>
             </div>

            {/* Mobile-Only Spacer for fixed video */}
            <div className={`md:hidden transition-all duration-300 ${isSticky ? 'h-[30vh]' : 'h-0'}`} />

            {/* Live Stats Overlay Grid */}
            {!isTheaterMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PollWidget />
                <PredictionHeatmap round={20} />
              </div>
            )}

            {/* Quality Controls for Desktop */}
            <div className="hidden lg:block">
              <Card glass className="flex justify-between items-center py-4 px-6 rounded-2xl border-white/10">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Grid Status</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        {isTheaterMode ? 'IMMERSIVE THEATER ACTIVE' : 'COMMAND CENTER GRID'}
                      </span>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {tracks.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-f1-red/30 text-f1-red text-[8px] tracking-[0.2em]"
                    >
                      <span className="w-1.5 h-1.5 bg-f1-red rounded-full animate-pulse mr-1" /> 
                      {tracks.length} SIGNALS FOUND
                    </Button>
                  )}
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Edge Node: FRA-01</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Left Sidebar: Telemetry & Sector Feed */}
          {!isTheaterMode && (
            <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
              <TrackStatusPanel />
              <SectorFeed />
            </div>
          )}

          {/* Right Sidebar: Chat */}
          {!isTheaterMode && (
            <div className="lg:col-span-1 order-3">
              <Card className="flex flex-col h-[500px] lg:h-[calc(100vh-14rem)] sticky top-24 p-0 overflow-hidden bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[2.5rem]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" /> 
                  Race Comms
                </h3>
                <Badge color="gray" className="scale-75">Secure</Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path d="M8 9h.01M16 9h.01M12 13c-2 0-3.5 1-3.5 2" /></svg>
                    <p className="text-xs font-bold uppercase tracking-widest text-center">No active chatter on this frequency.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <motion.div 
                      key={msg.id || idx} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isAdmin ? 'text-f1-red' : 'text-f1-gold'}`}>
                          {msg.senderName}
                        </span>
                        <div className="h-px flex-1 bg-white/5 group-hover:bg-white/10 transition-colors" />
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.isAdmin 
                          ? 'bg-f1-red/10 text-white border border-f1-red/20 shadow-[0_4px_15px_rgba(225,6,0,0.1)]' 
                          : 'bg-white/5 text-gray-200 border border-white/5'
                      }`}>
                        {msg.message}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-white/10 bg-white/[0.01]">
                <form onSubmit={sendChatMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Broadcast to channel..."
                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl pl-5 pr-14 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-f1-red/30 focus:bg-white/10 transition-all"
                    maxLength={200}
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 p-3 bg-f1-red text-white rounded-xl hover:bg-red-600 transition-all hover:scale-105 active:scale-90 shadow-lg"
                    disabled={!chatInput.trim()}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </button>
                </form>
              </div>
            </Card>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
