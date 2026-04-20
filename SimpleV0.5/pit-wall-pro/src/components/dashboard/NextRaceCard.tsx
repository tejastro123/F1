"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import type { Race } from "@/types/f1";
import { calculateCountdown, getCountryFlag, formatDate, pad } from "@/lib/utils";
import Image from "next/image";

interface Props { race: Race | null; isLoading: boolean; }

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 md:p-6 border border-white/10 bg-black/40 backdrop-blur-md hover:border-[var(--f1-red)]/50 transition-all group"
      style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}
    >
      <div className="font-orbitron font-black text-white group-hover:text-[var(--f1-red)] transition-colors leading-none tabular-nums mb-2"
        style={{ fontSize: "clamp(24px,4vw,42px)" }}>
        {pad(value)}
      </div>
      <div className="font-mono text-[8px] tracking-[0.3em] text-[var(--f1-gray-light)] uppercase">
        {label}
      </div>
    </div>
  );
}

export function NextRaceCard({ race, isLoading }: Props) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    if (!race) return;
    const update = () => setCountdown(calculateCountdown(race.date, race.time));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [race]);

  if (isLoading) {
    return (
      <div className="mb-8 h-80 skeleton rounded-xl opacity-20" />
    );
  }

  if (!race) return null;

  const flag = getCountryFlag(race.Circuit.Location.country);
  const raceName = race.raceName.replace(" Grand Prix", "").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-12 p-1 border border-white/5 bg-[#0a0a0a] relative overflow-hidden group"
      style={{ clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))" }}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[var(--f1-red)]/30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[var(--f1-red)]/30 pointer-events-none" />

      <div className="relative z-10 p-8 md:p-12 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12 items-center">
        
        {/* Circuit Visualization Background */}
        <div className="absolute right-0 top-0 w-full h-full opacity-10 pointer-events-none z-0">
          <Image 
            src="/circuit-map.png" 
            alt="Circuit Map" 
            fill 
            className="object-cover opacity-30 grayscale brightness-200"
            unoptimized
          />
        </div>

        {/* Content Side */}
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.5em] text-[var(--f1-red)] mb-1 uppercase font-bold">UPCOMING EVENT</div>
              <div className="h-0.5 w-12 bg-[var(--f1-red)]" />
            </div>
            <div className="px-4 py-1.5 border border-white/10 bg-white/5 font-mono text-[11px] tracking-widest text-white">
              ROUND {pad(parseInt(race.round))}
            </div>
          </div>

          <h2 className="font-orbitron font-black text-white leading-[0.9] uppercase mb-8 group-hover:translate-x-2 transition-transform duration-500"
            style={{ fontSize: "clamp(48px,8vw,90px)" }}>
            {raceName}<br/>
            <span className="text-[var(--f1-red)]">GRAND PRIX</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5 rounded-full text-2xl">
                  {flag}
                </div>
                <div>
                  <div className="font-rajdhani font-bold text-white text-lg leading-none mb-1">{race.Circuit.circuitName}</div>
                  <div className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase tracking-wider">
                    {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 font-mono text-[11px] text-white">
                  <Calendar size={14} className="text-[var(--f1-red)]" />
                  {formatDate(race.date)}
                </div>
                {race.time && (
                  <div className="flex items-center gap-2 font-mono text-[11px] text-white">
                    <Clock size={14} className="text-[var(--f1-red)]" />
                    {race.time.slice(0, 5)} UTC
                  </div>
                )}
              </div>
            </div>

            {/* Session Timeline */}
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[9px] tracking-[0.3em] text-[var(--f1-gray-light)] mb-2 uppercase">WEEKEND SCHEDULE</div>
              <div className="flex flex-wrap gap-2">
                {race.Qualifying && <ScheduleItem label="QUALI" time={race.Qualifying.date} />}
                {race.Sprint && <ScheduleItem label="SPRINT" time={race.Sprint.date} highlight />}
                <ScheduleItem label="RACE" time={race.date} active />
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Side */}
        <div className="relative z-10 flex flex-col items-center xl:items-end justify-center h-full border-l-0 xl:border-l border-white/10 xl:pl-12">
          <div className="font-mono text-[10px] tracking-[0.4em] text-[var(--f1-gray-light)] mb-8 uppercase text-center xl:text-right w-full">
            T-MINUS TO LIGHTS OUT
          </div>

          {countdown.total > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4 w-full max-w-[320px]">
              <CountdownCell value={countdown.days} label="DAYS" />
              <CountdownCell value={countdown.hours} label="HRS" />
              <CountdownCell value={countdown.minutes} label="MIN" />
              <CountdownCell value={countdown.seconds} label="SEC" />
            </div>
          ) : (
            <div className="p-8 border-2 border-[var(--f1-red)] bg-[var(--f1-red)]/10 text-center animate-glow">
              <div className="font-orbitron font-black text-white text-3xl tracking-tighter mb-2">LIVE SESSION</div>
              <div className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.3em] animate-pulse">● TRACK MONITOR ACTIVE</div>
            </div>
          )}

          <button className="mt-10 w-full group/btn flex items-center justify-between px-6 py-4 bg-[var(--f1-red)] text-white font-orbitron font-bold text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all">
            VIEW FULL EVENT DETAILS
            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ScheduleItem({ label, time, active, highlight }: { label: string; time: string; active?: boolean; highlight?: boolean }) {
  return (
    <div className={`px-3 py-2 border font-mono text-[9px] tracking-widest transition-all ${
      active 
        ? "border-[var(--f1-red)] bg-[var(--f1-red)] text-white" 
        : highlight 
          ? "border-orange-500 bg-orange-500/10 text-orange-500" 
          : "border-white/10 text-[var(--f1-gray-light)] hover:border-white/30"
    }`}
      style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
      {label}
    </div>
  );
}

