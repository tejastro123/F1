"use client";

import { motion } from "framer-motion";
import { pad } from "@/lib/utils";
import type { UserProfile } from "@/types/f1";
import Image from "next/image";

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
      className="relative pt-32 pb-24 overflow-hidden min-h-[500px] flex items-center"
    >
      {/* Background Image Overlay */}
      <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none z-0">
        <Image 
          src="/hero-car.png" 
          alt="F1 Car" 
          fill 
          className="object-cover object-right transform scale-x-[-1] mask-gradient-to-l"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--f1-darker)] via-[var(--f1-darker)]/40 to-transparent z-0" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        {/* Main Brand Content */}
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 font-mono text-[11px] font-bold tracking-[0.4em] text-[var(--f1-red)] px-6 py-3 mb-8 border border-[var(--f1-red)] bg-[rgba(225,6,0,0.1)] backdrop-blur-md"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
          >
            <span className="live-dot" />
            PIT WALL CONTROL · SESSION ACTIVE
          </motion.div>

          <h1
            className="font-orbitron font-black text-white leading-[0.85] uppercase mb-6"
            style={{ fontSize: "clamp(64px, 12vw, 160px)", letterSpacing: "-0.04em" }}
          >
            <span className="text-gradient block">STRATEGY</span>
            <span className="block opacity-90">COMMAND</span>
          </h1>

          <div className="flex flex-wrap items-center gap-8 mt-10">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-[0.3em] uppercase mb-2">SYSTEM STATUS</span>
              <span className="font-orbitron font-bold text-sm text-[var(--f1-red)] tracking-widest animate-pulse">● OPTIMAL</span>
            </div>
            <div className="w-px h-10 bg-[var(--f1-gray)] opacity-30" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-[0.3em] uppercase mb-2">OPERATOR</span>
              <span className="font-orbitron font-bold text-sm text-white tracking-widest">{profile.username.toUpperCase()}</span>
            </div>
            <div className="w-px h-10 bg-[var(--f1-gray)] opacity-30" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-[0.3em] uppercase mb-2">NETWORK</span>
              <span className="font-orbitron font-bold text-sm text-white tracking-widest">LIVE-SECURE</span>
            </div>
          </div>
        </div>

        {/* Date / Greeting Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="shrink-0 p-8 border border-white/10 bg-white/5 backdrop-blur-xl min-w-[300px]"
          style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
        >
          <div className="font-mono text-[10px] tracking-[0.4em] text-[var(--f1-red)] mb-4">ENGINEERING LOG</div>
          <div className="font-rajdhani font-bold text-2xl tracking-wider text-white uppercase mb-2">
            {TimeGreeting()}
          </div>
          <div className="font-mono text-[12px] tracking-[0.2em] text-[var(--f1-gray-light)] uppercase border-t border-white/10 pt-4 mt-4">
            <DateLine />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="h-1 w-full bg-[var(--f1-red)]" />
              <div className="h-1 w-[60%] bg-[var(--f1-red)]/50" />
            </div>
            <div className="font-mono text-[9px] text-[var(--f1-gray-light)] text-right">
              VOLTS: 14.2V<br/>
              TEMP: 24°C
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

