import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoTrack } from '@livekit/components-react';
import { VideoQuality } from 'livekit-client';
import { Badge, Button } from '../ui.jsx';

export default function AdvancedPlayer({ trackRef, isLive, onQualityChange, onTheaterMode, isTheaterMode }) {
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('high');
  
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showSettings) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showSettings]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePip = async () => {
    try {
      const video = containerRef.current?.querySelector('video');
      if (video && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      }
    } catch (e) {
      console.error('PiP error', e);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'f') toggleFullscreen();
      if (key === 'm') setIsMuted(prev => !prev);
      if (key === 'p') togglePip();
      if (key === 't') onTheaterMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full bg-black group cursor-none data-[show=true]:cursor-default overflow-hidden"
      data-show={showControls}
    >
      {/* Actual Video */}
      <VideoTrack 
        trackRef={trackRef} 
        className="w-full h-full object-contain"
        muted={isMuted}
      />

      {/* Overlay: Custom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-30 flex flex-col justify-between p-4 md:p-6"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {isLive && (
                  <Badge color="red" className="animate-pulse bg-red-600/20 ring-1 ring-red-500/50">LIVE</Badge>
                )}
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] drop-shadow-lg">
                  F1 Edge Network: Signal Optimized
                </span>
              </div>
            </div>

            {/* Bottom Bar Controls */}
            <div className="space-y-4">
              {/* Progress Bar (Fake for Live, real for VOD if implemented later) */}
              <div className="relative h-1 w-full bg-white/10 rounded-full cursor-pointer group/progress">
                 <div className="absolute top-0 left-0 h-full w-full bg-f1-red" />
                 <div className="absolute -top-1 right-0 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Play/Pause icon (static for now as it is live) */}
                  <button className="text-white hover:text-f1-red transition-colors">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </button>

                  <div className="flex items-center gap-3 group/vol">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-f1-red transition-colors">
                      {isMuted || volume === 0 ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zm12 4l-4 4m0-4l4 4" /></svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zm4 12c1.1-1.2 2-2.9 2-5s-.9-3.8-2-5" /></svg>
                      )}
                    </button>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={volume} 
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-0 group-hover/vol:w-20 transition-all accent-f1-red bg-white/20 h-1 overflow-hidden" 
                    />
                  </div>

                  <span className="text-[10px] font-black text-white/80 uppercase tracking-widest hidden sm:block">
                     {isLive ? '00:00:26 / LIVE' : '00:00 / 00:00'}
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:text-f1-red transition-colors relative">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={showSettings ? 'animate-spin-slow' : ''}>
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-10 right-0 w-48 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-2"
                        >
                          <div className="p-2 border-b border-white/5 text-[8px] font-black text-white/40 uppercase tracking-widest">Quality</div>
                          {['high', 'medium', 'low'].map(q => (
                            <button 
                              key={q} 
                              onClick={() => {
                                setQuality(q);
                                onQualityChange(q);
                                setShowSettings(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 rounded-xl transition-colors ${quality === q ? 'text-f1-red bg-white/5' : 'text-white/60'}`}
                            >
                              {q === 'high' ? '4K Source' : q === 'medium' ? '1080p' : 'Data Saver'}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <button onClick={togglePip} title="Picture in Picture (P)" className="text-white hover:text-f1-red transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>
                  </button>

                  <button onClick={onTheaterMode} title="Theater Mode (T)" className="text-white hover:text-f1-red transition-colors hidden md:block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="6" width="18" height="12" rx="1" />
                    </svg>
                  </button>

                  <button onClick={toggleFullscreen} title="Fullscreen (F)" className="text-white hover:text-f1-red transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 00 2-2v-3M3 16v3a2 2 0 00 2 2h3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback Overlay (Center pause/play indicator) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <motion.div 
            initial={false}
            animate={{ scale: showControls ? 1 : 0.8, opacity: showControls ? 0.2 : 0 }}
            className="text-white text-9xl font-black italic tracking-tighter uppercase select-none"
         >
            F1 LIVE
         </motion.div>
      </div>
    </div>
  );
}
