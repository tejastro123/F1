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
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--f1-red)]"
              style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
              <Radio size={16} className="text-white" />
            </div>
            <h1 className="font-orbitron font-black text-2xl md:text-4xl text-white tracking-widest uppercase text-gradient">
              LIVE RACE
            </h1>
          </div>
          {liveRace && (
            <p className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              {liveRace.sessionName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 border font-mono text-[11px] tracking-widest ${isConnected
              ? "border-green-500/40 bg-green-500/5 text-green-400"
              : "border-[var(--f1-gray)] text-[var(--f1-gray-light)]"
            }`}
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
            <Wifi size={12} />
            {isConnected ? "LIVE FEED ACTIVE" : "CONNECTING..."}
          </div>
          {lastUpdate && (
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">
              UPDATED {lastUpdate.toLocaleTimeString()}
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

function LiveLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-14 rounded" />
      ))}
    </div>
  );
}
