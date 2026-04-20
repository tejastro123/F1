"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useF1Data } from "@/hooks/useF1Data";
import { useF1Store } from "@/store/f1Store";
import { useUserStore } from "@/store/f1Store";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { NextRaceCard } from "@/components/dashboard/NextRaceCard";
import { DriverStandingsCard } from "@/components/dashboard/DriverStandingsCard";
import { ConstructorStandingsCard } from "@/components/dashboard/ConstructorStandingsCard";
import { LastRaceResults } from "@/components/dashboard/LastRaceResults";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { PitWallStats } from "@/components/dashboard/PitWallStats";
import { SeasonAnalyticsPreview } from "@/components/dashboard/SeasonAnalyticsPreview";

export default function DashboardPage() {
  const { isLoading, isError, refetchAll } = useF1Data();
  const { driverStandings, constructorStandings, nextRace, lastRace, lastRaceResults } = useF1Store();
  const { profile } = useUserStore();

  return (
    <div className="pb-32">
      {/* Hero Section - Full Width Background */}
      <div className="relative w-full border-b border-white/5 overflow-hidden">
        <div className="max-w-[1700px] mx-auto px-6 md:px-12">
          <HeroSection profile={profile} isLoading={isLoading} />
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 md:px-12 mt-10">

      {/* Connection Status Banner */}
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between p-5 border border-yellow-500/30 bg-yellow-500/5 backdrop-blur-md"
          style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="font-mono text-[11px] text-yellow-400 tracking-[0.2em] uppercase font-bold">
              SYSTEM ALERT: API CONNECTION UNSTABLE — REDUNDANCY ACTIVE
            </span>
          </div>
          <button
            onClick={refetchAll}
            className="flex items-center gap-2 font-orbitron font-bold text-[10px] text-white hover:text-[var(--f1-red)] transition-colors px-4 py-2 border border-white/10 bg-white/5"
          >
            <RefreshCw size={12} /> RE-ESTABLISH UPLINK
          </button>
        </motion.div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Column - Core Intel (8 cols) */}
        <div className="xl:col-span-8 space-y-12">
          
          {/* Global Season Stats Bar */}
          <PitWallStats />

          {/* Next Race Featured Card */}
          <NextRaceCard race={nextRace} isLoading={isLoading} />

          {/* Season Analytics / Trend Chart */}
          <SeasonAnalyticsPreview drivers={driverStandings} />

          {/* Last Race In-Depth */}
          {lastRace && (
            <LastRaceResults
              race={lastRace}
              results={lastRaceResults}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Right Column - Secondary Data & Navigation (4 cols) */}
        <div className="xl:col-span-4 space-y-10">
          
          {/* Quick Access Menu */}
          <div className="border border-white/10 bg-white/[0.01] backdrop-blur-md" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 30px 100%, 0 calc(100% - 30px))" }}>
            <QuickLinks />
          </div>

          {/* Mini Driver Standings */}
          <DriverStandingsCard
            standings={driverStandings}
            favoriteDriver={profile.favoriteDriver}
            isLoading={isLoading}
          />

          {/* Mini Constructor Standings */}
          <ConstructorStandingsCard
            standings={constructorStandings}
            favoriteTeam={profile.favoriteTeam}
            isLoading={isLoading}
          />

          {/* Technical Info Block */}
          <div className="p-8 border border-white/10 bg-white/[0.02] font-mono text-[10px] text-[var(--f1-gray-light)] space-y-5 relative overflow-hidden"
            style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)" }}>
            <div className="flex justify-between border-b border-white/5 pb-3">
              <span className="opacity-60">UPLINK_SOURCE</span>
              <span className="text-white font-bold">FAST_F1_REALTIME</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-3">
              <span className="opacity-60">PING_LATENCY</span>
              <span className="text-[var(--f1-red)] font-bold">0.024s</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">ENCRYPTION</span>
              <span className="text-white font-bold uppercase">End-to-End</span>
            </div>
            {/* Small tech accent */}
            <div className="absolute top-0 right-0 w-2 h-full bg-[var(--f1-red)] opacity-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
