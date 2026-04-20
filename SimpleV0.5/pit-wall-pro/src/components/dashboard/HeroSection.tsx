"use client";

import { motion } from "framer-motion";
import { pad } from "@/lib/utils";
import type { UserProfile } from "@/types/f1";

interface Props { profile: UserProfile; isLoading: boolean; }

function TimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function DateLine() {
  const now = new Date();
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return <>{days[now.getDay()]} · {pad(now.getDate())} {months[now.getMonth()]} · {now.getFullYear()}</>;
}

export function HeroSection({ profile }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="pt-10 pb-8"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Brand badge */}
        <div>
          <div
            className="inline-flex items-center gap-4 font-mono text-[11px] font-bold tracking-[0.3em] text-[var(--f1-red)] px-5 py-3 mb-6 border-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.08)]"
            style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}
          >
            <span className="live-dot" />
            F1 LIVE TRACKER · 2026 SEASON
          </div>

          <h1
            className="font-orbitron font-black text-gradient leading-[0.9] uppercase mb-4"
            style={{ fontSize: "clamp(52px,10vw,130px)", letterSpacing: "-0.02em" }}
          >
            TEJAS&apos;S<br />PIT WALL
          </h1>

          <div
            className="h-1.5 w-48 bg-[var(--f1-red)] mb-6"
            style={{ clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 100%,10px 100%)" }}
          />

          <p className="font-mono text-[12px] tracking-[0.25em] text-[var(--f1-gray-light)] uppercase">
            DRIVERS · CONSTRUCTORS · CALENDAR · TELEMETRY · AI
          </p>
        </div>

        {/* Date / Greeting */}
        <div className="text-right shrink-0">
          <div className="font-rajdhani font-bold text-lg tracking-wider text-white uppercase mb-1">
            <TimeGreeting />, {profile.username.toUpperCase()}
          </div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--f1-gray-light)] uppercase">
            <DateLine />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <div className="px-3 py-1.5 border border-[var(--f1-red)] bg-[rgba(225,6,0,0.1)]"
              style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
              <span className="font-orbitron font-bold text-[10px] text-[var(--f1-red)] tracking-widest">
                ● LIVE DATA FEED
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
