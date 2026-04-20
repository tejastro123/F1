"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useF1Data } from "@/hooks/useF1Data";
import { useF1Store } from "@/store/f1Store";
import { useUserStore } from "@/store/f1Store";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { NextRaceCard } from "@/components/dashboard/NextRaceCard";
import { DriverStandingsCard } from "@/components/dashboard/DriverStandingsCard";
import { ConstructorStandingsCard } from "@/components/dashboard/ConstructorStandingsCard";
import { LastRaceResults } from "@/components/dashboard/LastRaceResults";
import { SeasonStats } from "@/components/dashboard/SeasonStats";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import type { Metadata } from "next";

export default function DashboardPage() {
  const { isLoading, isError, refetchAll } = useF1Data();
  const { driverStandings, constructorStandings, nextRace, lastRace, lastRaceResults } = useF1Store();
  const { profile } = useUserStore();

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20">
      {/* Hero */}
      <HeroSection profile={profile} isLoading={isLoading} />

      {/* Error Banner */}
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-0 mb-6 flex items-center justify-between p-4 border border-yellow-500/40 bg-yellow-500/5"
          style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
        >
          <span className="font-mono text-[11px] text-yellow-400 tracking-widest">
            ⚠ API CONNECTION ISSUE — SHOWING CACHED DATA
          </span>
          <button
            onClick={refetchAll}
            className="flex items-center gap-2 font-mono text-[10px] text-[var(--f1-red)] hover:text-white transition-colors"
          >
            <RefreshCw size={12} /> RETRY
          </button>
        </motion.div>
      )}

      {/* Next Race */}
      <NextRaceCard race={nextRace} isLoading={isLoading} />

      {/* Quick Links */}
      <QuickLinks />

      {/* Season Stats */}
      <SeasonStats
        drivers={driverStandings}
        teams={constructorStandings}
        races={useF1Store.getState().races}
      />

      {/* Standings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <DriverStandingsCard
          standings={driverStandings}
          favoriteDriver={profile.favoriteDriver}
          isLoading={isLoading}
        />
        <ConstructorStandingsCard
          standings={constructorStandings}
          favoriteTeam={profile.favoriteTeam}
          isLoading={isLoading}
        />
      </div>

      {/* Last Race */}
      {lastRace && (
        <LastRaceResults
          race={lastRace}
          results={lastRaceResults}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
