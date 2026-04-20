"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack,
  RotateCcw, History, LayoutGrid, Map as MapIcon,
  Activity, Clock, Gauge
} from "lucide-react";
import { LiveLeaderboard } from "@/components/live/LiveLeaderboard";
import { InteractiveTrackMap } from "@/components/live/InteractiveTrackMap";
import { GapSnakeChart } from "@/components/live/GapSnakeChart";
import { RaceControlFeed } from "@/components/live/RaceControlFeed";
import { TrackConditions } from "@/components/live/TrackConditions";
import { generateMockLiveRace } from "@/lib/mock-data";
import { useLiveRace } from "@/hooks/useLiveRace";
import { useLiveRaceStore } from "@/store/f1Store";

export default function RaceReplayPage() {
  useLiveRace();
  const { isConnected } = useLiveRaceStore();
  const [currentLap, setCurrentLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<"standard" | "compact">("standard");

  const totalLaps = 57;

  // Memoize race data for the current lap
  const raceData = useMemo(() => generateMockLiveRace(currentLap), [currentLap]);

  const currentLapRef = useRef(currentLap);
  useEffect(() => {
    currentLapRef.current = currentLap;
  }, [currentLap]);

  // Handle Playback Logic
  useEffect(() => {
    if (!isPlaying) return;

    if (currentLapRef.current >= totalLaps) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentLap(prev => {
        const next = prev + 1;
        if (next >= totalLaps) {
          setIsPlaying(false);
          return totalLaps;
        }
        return next;
      });
    }, 2000 / playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, totalLaps, playbackSpeed]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLap(parseInt(e.target.value));
  };

  const resetReplay = () => {
    setCurrentLap(1);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-32">
      {/* Replay Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--f1-red)]"
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
            <History size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-2xl md:text-3xl text-white tracking-widest uppercase">
              RACE REPLAY
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-[10px] text-[var(--f1-red)] font-bold tracking-widest uppercase">ARCHIVE_SESSION</span>
              <span className="text-[var(--f1-gray-light)] font-mono text-[10px]">/</span>
              <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest uppercase">2025 ABU DHABI GRAND PRIX</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "standard" ? "compact" : "standard")}
            className="p-2 border border-[var(--f1-gray)] text-[var(--f1-gray-light)] hover:text-white hover:border-white transition-all"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
          >
            <LayoutGrid size={16} />
          </button>
          <div className="h-8 w-px bg-[var(--f1-gray)]/30 mx-2" />
          <div className="flex flex-col items-end">
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase tracking-tighter">DATA_INTEGRITY</div>
            <div className="font-mono text-[11px] text-green-400 uppercase tracking-widest">VERIFIED</div>
          </div>
        </div>
      </div>

      {/* Main Replay Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Leaderboard & Charts */}
        <div className="lg:col-span-8 space-y-8">
          <div className="card-base p-6 relative overflow-hidden"
            style={{ clipPath: "polygon(0 0,calc(100% - 30px) 0,100% 30px,100% 100%,0 100%)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[var(--f1-red)]" />
                <h2 className="font-orbitron font-bold text-lg text-white tracking-widest">LAP {currentLap}/{totalLaps}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase">Session Time</div>
                  <div className="font-mono text-sm text-white">{raceData.timeElapsed}</div>
                </div>
              </div>
            </div>

            <LiveLeaderboard drivers={raceData.drivers} />
          </div>

          <GapSnakeChart drivers={raceData.drivers} />
        </div>

        {/* Right Column: Track & Analytics */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-base p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--f1-gray)] pb-3">
              <MapIcon size={14} className="text-[var(--f1-red)]" />
              <span className="font-orbitron font-bold text-[11px] text-white tracking-[0.2em]">SPATIAL_TELEMETRY</span>
            </div>
            <InteractiveTrackMap drivers={raceData.drivers} />
          </div>

          <TrackConditions race={raceData} />
          <RaceControlFeed />

          <div className="card-base p-5 bg-gradient-to-br from-[var(--f1-dark)] to-black">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-blue-400" />
              <span className="font-orbitron font-bold text-[11px] text-white tracking-[0.2em]">REPLAY_ANALYTICS</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-[var(--f1-gray-light)]">AVERAGE_LAP_TIME</span>
                <span className="font-mono text-[12px] text-white">1:24.452</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-[var(--f1-gray-light)]">OVERTAKES_DETECTION</span>
                <span className="font-mono text-[12px] text-green-400">12 TOTAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-[var(--f1-gray-light)]">TIRE_DEGRADATION_AVG</span>
                <span className="font-mono text-[12px] text-orange-400">0.4% / LAP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Engineering Playback Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[95%] max-w-[1000px]">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[var(--f1-darker)]/90 backdrop-blur-xl border border-[var(--f1-gray)]/40 p-3 shadow-2xl relative"
          style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}
        >
          {/* Timeline - Integrated Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--f1-gray)]/20">
            <div 
              className="h-full bg-[var(--f1-red)] transition-all duration-300" 
              style={{ width: `${(currentLap / totalLaps) * 100}%` }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-6">
              {/* Primary Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={resetReplay}
                  className="p-1.5 text-[var(--f1-gray-light)] hover:text-white transition-colors"
                  title="Reset Replay"
                >
                  <RotateCcw size={14} />
                </button>
                
                <div className="w-px h-4 bg-[var(--f1-gray)]/30 mx-1" />

                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 flex items-center justify-center bg-[var(--f1-red)] text-white hover:bg-red-700 transition-all"
                  style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>

                <div className="w-px h-4 bg-[var(--f1-gray)]/30 mx-1" />

                <div className="flex items-center">
                  {[1, 2, 5, 10].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 font-mono text-[9px] tracking-tighter transition-all ${
                        playbackSpeed === speed ? "text-[var(--f1-red)] font-bold" : "text-[var(--f1-gray-light)] hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex-1 flex items-center gap-3">
                <span className="font-mono text-[9px] text-[var(--f1-gray-light)] w-8 text-right">L{currentLap}</span>
                <input
                  type="range"
                  min="1"
                  max={totalLaps}
                  value={currentLap}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-[var(--f1-gray)]/30 rounded-full appearance-none cursor-pointer accent-[var(--f1-red)]"
                />
                <span className="font-mono text-[9px] text-[var(--f1-gray-light)] w-8">L{totalLaps}</span>
              </div>

              {/* Status Tags */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-tighter">DATA_SYNC</div>
                  <div className="font-mono text-[9px] text-green-400 leading-none">ACTIVE</div>
                </div>
                <div className="w-px h-6 bg-[var(--f1-gray)]/30" />
                <div className="flex flex-col items-end">
                  <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-tighter">SESSION_TIME</div>
                  <div className="font-mono text-[9px] text-white leading-none">{raceData.timeElapsed}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
