"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { Race } from "@/types/f1";
import { calculateCountdown, getCountryFlag, formatDate, pad } from "@/lib/utils";

interface Props { race: Race | null; isLoading: boolean; }

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 md:p-6 border-2 border-[var(--f1-gray)] bg-[var(--f1-darker)] hover:border-[var(--f1-red)] hover:bg-[rgba(225,6,0,0.05)] transition-all group"
      style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}
    >
      <div className="font-orbitron font-black text-[var(--f1-red)] leading-none tabular-nums mb-3"
        style={{ fontSize: "clamp(28px,5vw,52px)" }}>
        {pad(value)}
      </div>
      <div className="font-mono text-[9px] tracking-[0.2em] text-[var(--f1-gray-light)] uppercase">
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
      <div className="mb-8 h-64 skeleton rounded" />
    );
  }

  if (!race) return null;

  const flag = getCountryFlag(race.Circuit.Location.country);
  const raceName = race.raceName.replace(" Grand Prix", "").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="mb-8 p-6 md:p-10 border-2 border-[var(--f1-red)] bg-gradient-to-br from-[var(--f1-dark)] to-[var(--f1-black)] relative overflow-hidden"
      style={{ clipPath: "polygon(0 0,calc(100% - 30px) 0,100% 30px,100% 100%,30px 100%,0 calc(100% - 30px))" }}
    >
      {/* BG pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,var(--f1-red) 0,var(--f1-red) 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-16">
        {/* Left */}
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--f1-red)] px-4 py-2 border-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.1)]"
              style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
              ● ROUND {pad(parseInt(race.round))} · UP NEXT
            </div>
            <span className="text-4xl">{flag}</span>
          </div>

          <h2 className="font-orbitron font-black text-white leading-[0.95] uppercase mb-4"
            style={{ fontSize: "clamp(36px,6vw,76px)" }}>
            {raceName}
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 font-rajdhani font-semibold text-base text-[var(--f1-white)]">
              <MapPin size={14} className="text-[var(--f1-red)]" />
              <strong>{race.Circuit.circuitName}</strong>
              <span className="text-[var(--f1-gray-light)]">· {race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--f1-gray-light)]">
              <Calendar size={12} className="text-[var(--f1-red)]" />
              {formatDate(race.date)} · Round {race.round} of 24
              {race.time && (
                <><Clock size={12} className="ml-2 text-[var(--f1-red)]" /> {race.time.slice(0, 5)} UTC</>
              )}
            </div>
          </div>

          {/* Weekend sessions */}
          {(race.FirstPractice || race.Qualifying) && (
            <div className="flex flex-wrap gap-2">
              {race.FirstPractice && (
                <SessionBadge label="FP1" date={race.FirstPractice.date} />
              )}
              {race.SecondPractice && (
                <SessionBadge label="FP2" date={race.SecondPractice.date} />
              )}
              {race.ThirdPractice && (
                <SessionBadge label="FP3" date={race.ThirdPractice.date} />
              )}
              {race.Sprint && (
                <SessionBadge label="SPRINT" date={race.Sprint.date} highlight />
              )}
              {race.Qualifying && (
                <SessionBadge label="QUALI" date={race.Qualifying.date} />
              )}
              <SessionBadge label="RACE" date={race.date} highlight />
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-[var(--f1-gray-light)] mb-6 uppercase">
            <span className="live-dot" />
            LIGHTS OUT IN
          </div>

          {countdown.total > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              <CountdownCell value={countdown.days} label="DAYS" />
              <CountdownCell value={countdown.hours} label="HRS" />
              <CountdownCell value={countdown.minutes} label="MIN" />
              <CountdownCell value={countdown.seconds} label="SEC" />
            </div>
          ) : (
            <div className="font-orbitron font-black text-[var(--f1-red)] text-3xl tracking-wider animate-pulse">
              RACE IN PROGRESS
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SessionBadge({ label, date, highlight }: { label: string; date: string; highlight?: boolean }) {
  return (
    <div className={`px-3 py-1.5 border font-mono text-[10px] tracking-widest ${
      highlight
        ? "border-[var(--f1-red)] bg-[rgba(225,6,0,0.1)] text-[var(--f1-red)]"
        : "border-[var(--f1-gray)] text-[var(--f1-gray-light)]"
    }`}
      style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
      {label} · {formatDate(date)}
    </div>
  );
}
