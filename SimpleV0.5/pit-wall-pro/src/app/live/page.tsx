"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLiveRaceStore } from "@/store/f1Store";
import { useLiveRace } from "@/hooks/useLiveRace";
import { LiveLeaderboard } from "@/components/live/LiveLeaderboard";
import { TrackConditions } from "@/components/live/TrackConditions";
import { LiveTelemetryChart } from "@/components/live/LiveTelemetryChart";
import { SafetyCarBanner } from "@/components/live/SafetyCarBanner";
import { RaceProgress } from "@/components/live/RaceProgress";
import { Radio, Wifi } from "lucide-react";

import { GapSnakeChart } from "@/components/live/GapSnakeChart";
import { RaceControlFeed } from "@/components/live/RaceControlFeed";
import { InteractiveTrackMap } from "@/components/live/InteractiveTrackMap";

export default function LivePage() {
  useLiveRace(); // Initializes WS / mock data
  const { liveRace, isConnected, lastUpdate } = useLiveRaceStore();

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Page Header - HUD Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-8"
      >
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-[var(--f1-red)] blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative p-4 bg-[var(--f1-black)] border border-[var(--f1-red)]"
              style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
              <Radio size={24} className="text-[var(--f1-red)] animate-pulse" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold">STREAMING_LIVE</span>
              <div className="h-[1px] w-8 bg-[var(--f1-red)]/30" />
            </div>
            <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase">
              LIVE_TRACK_<span className="text-[var(--f1-red)]">INTEL</span>
            </h1>
            {liveRace && (
              <div className="flex items-center gap-4 mt-2">
                <p className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-[0.2em] uppercase">
                  {liveRace.sessionName} · {liveRace.raceStatus}
                </p>
                <span className="text-white/10">|</span>
                <p className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.2em] uppercase">
                  ENCRYPTION: AES-256
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge 
            active={isConnected} 
            label="COMMS_UPLINK" 
            value={isConnected ? "ESTABLISHED" : "SEARCHING..."} 
            color={isConnected ? "var(--f1-red)" : "var(--f1-gray)"}
          />
          <StatusBadge 
            active={true} 
            label="SERVER_REGION" 
            value="AWS_EU_CENTRAL" 
            color="white"
          />
          {lastUpdate && (
            <div className="pl-6 border-l border-white/10 hidden xl:block">
              <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mb-1 uppercase">LAST_PACKET_RCVD</div>
              <div className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {!liveRace ? (
        <LiveLoadingSkeleton />
      ) : (
        <>
          {/* Safety Car / Red Flag Banner */}
          <SafetyCarBanner status={liveRace.safetyCarStatus} />

          {/* Race Progress */}
          <RaceProgress
            currentLap={liveRace.currentLap}
            totalLaps={liveRace.totalLaps}
            timeElapsed={liveRace.timeElapsed}
            raceStatus={liveRace.raceStatus}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 mb-8">
            {/* Main Content Area */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <LiveLeaderboard drivers={liveRace.drivers} />

              {/* Gap Snake Chart */}
              <GapSnakeChart drivers={liveRace.drivers} />
            </div>

            {/* Side panel */}
            <div className="flex flex-col gap-6">
              {/* Interactive Track Map */}
              <InteractiveTrackMap drivers={liveRace.drivers} />

              <TrackConditions race={liveRace} />
              <RaceControlFeed />

              {/* Telemetry Chart in sidebar or below */}
              <div className="card-base p-4">
                <div className="font-orbitron font-bold text-[10px] text-white tracking-widest mb-4">MINI_TELEMETRY (P1-P3)</div>
                <LiveTelemetryChart drivers={liveRace.drivers.slice(0, 3)} height={200} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ active, label, value, color }: { active: boolean; label: string; value: string; color: string }) {
  return (
    <div className="px-5 py-3 border border-white/10 bg-white/[0.02] backdrop-blur-md min-w-[160px]"
      style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.2em] mb-1 uppercase">{label}</div>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse' : 'opacity-30'}`} style={{ backgroundColor: color }} />
        <div className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">{value}</div>
      </div>
    </div>
  );
}

function LiveLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-14 rounded" />
      ))}
    </div>
  );
}
