"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon, MapPin, Clock,
  ChevronRight, Info, Cloud, Ticket,
  Timer, Flag, Navigation
} from "lucide-react";
import { useF1Store } from "@/store/f1Store";
import type { Race } from "@/types/f1";

// Helper for countdown
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function CalendarPage() {
  const { races, nextRace, seasonResults } = useF1Store();
  const [userSelectedRace, setUserSelectedRace] = useState<Race | null>(null);

  // Helper to get podium from store data
  const getPodium = (round: string) => {
    const results = seasonResults[round] || [];
    return results.slice(0, 3).map(r => r.Driver.code);
  };

  // Derived state: Use the user's selection, or fall back to the next race
  const selectedRace = userSelectedRace || nextRace;

  const countdown = useCountdown(nextRace?.date || "2026-03-14");

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-[var(--f1-red)]"
          style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
          <CalendarIcon size={24} className="text-white" />
        </div>
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          2026 SEASON CALENDAR
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
      </div>

      {/* Hero Countdown */}
      {nextRace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 p-8 border-2 border-[var(--f1-red)] overflow-hidden group"
          style={{ clipPath: "polygon(0 0,calc(100% - 40px) 0,100% 40px,100% 100%,0 100%)" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Timer size={200} />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--f1-red)] text-white font-mono text-[10px] font-bold tracking-widest uppercase mb-4"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                <Flag size={12} /> NEXT EVENT
              </div>
              <h2 className="font-orbitron font-black text-4xl text-white tracking-widest uppercase mb-2">
                {nextRace.raceName}
              </h2>
              <div className="flex items-center gap-2 text-[var(--f1-gray-light)] font-mono text-sm tracking-widest mb-6">
                <MapPin size={14} className="text-[var(--f1-red)]" />
                {nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}
              </div>

              {/* Countdown Display */}
              <div className="flex gap-4">
                {[
                  { label: "DAYS", value: countdown.days },
                  { label: "HRS", value: countdown.hours },
                  { label: "MINS", value: countdown.minutes },
                  { label: "SECS", value: countdown.seconds }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="font-orbitron font-black text-3xl md:text-5xl text-white">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex justify-end">
              <div className="p-6 border border-[var(--f1-gray)] bg-black/40 backdrop-blur-md max-w-xs"
                style={{ clipPath: "polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)" }}>
                <div className="flex items-center gap-2 text-[var(--f1-red)] font-orbitron font-bold text-[10px] tracking-widest mb-4">
                  <Navigation size={12} /> CIRCUIT_SPECS
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[var(--f1-gray)]/30 pb-2">
                    <span className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase">Distance</span>
                    <span className="font-mono text-[11px] text-white">306.183 KM</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--f1-gray)]/30 pb-2">
                    <span className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase">Laps</span>
                    <span className="font-mono text-[11px] text-white">57</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--f1-gray)]/30 pb-2">
                    <span className="font-mono text-[10px] text-[var(--f1-gray-light)] uppercase">Lap Record</span>
                    <span className="font-mono text-[11px] text-white">1:24.125</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-[var(--f1-gray)]/20 hover:bg-[var(--f1-red)] text-white font-orbitron font-bold text-[10px] tracking-[0.3em] transition-all"
                  style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                  BOOK TICKETS
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid: List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Race List */}
        <div className="lg:col-span-7 space-y-4 h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          {races.map((race, i) => {
            const isSelected = selectedRace?.round === race.round;
            const isPast = new Date(race.date) < new Date();

            return (
              <motion.div
                key={race.round}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setUserSelectedRace(race)}
                className={`relative p-5 cursor-pointer border-l-4 transition-all group ${isSelected
                    ? "bg-[rgba(225,6,0,0.1)] border-[var(--f1-red)]"
                    : "bg-[var(--f1-dark)] border-[var(--f1-gray)] hover:border-[var(--f1-gray-light)]"
                  }`}
                style={{ clipPath: "polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="font-orbitron font-black text-2xl text-[var(--f1-gray)] w-8 opacity-40 group-hover:opacity-100 transition-opacity">
                      {race.round.padStart(2, '0')}
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase mb-1">
                        {new Date(race.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isPast && <span className="ml-2 text-[var(--f1-red)] font-bold">COMPLETED</span>}
                      </div>
                      <div className="font-orbitron font-bold text-lg text-white tracking-widest uppercase group-hover:text-[var(--f1-red)] transition-colors">
                        {race.raceName.replace(" Grand Prix", "")}
                      </div>
                      {isPast && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {getPodium(race.round).map((code, idx) => (
                            <span key={code} 
                              className={`font-mono text-[8px] px-1.5 py-0.5 border ${
                                idx === 0 ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/10" : 
                                idx === 1 ? "border-slate-300/50 text-slate-300 bg-slate-300/10" : 
                                "border-amber-600/50 text-amber-600 bg-amber-600/10"
                              }`}
                              style={{ clipPath: "polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px)" }}>
                              {idx + 1}. {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className={`transition-transform ${isSelected ? "text-[var(--f1-red)] translate-x-2" : "text-[var(--f1-gray)]"}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Detailed View */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedRace ? (
              <motion.div
                key={selectedRace.round}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-base p-8 sticky top-24 border-t-2 border-[var(--f1-red)]"
                style={{ clipPath: "polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)" }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="font-mono text-[10px] text-[var(--f1-red)] tracking-widest uppercase font-bold mb-1">ROUND {selectedRace.round}</div>
                    <h3 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase">{selectedRace.raceName}</h3>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest uppercase">Location</div>
                    <div className="font-rajdhani font-bold text-lg text-white">{selectedRace.Circuit.Location.locality}</div>
                  </div>
                </div>

                {/* Top 3 Results (if past) */}
                {new Date(selectedRace.date) < new Date() && (
                    <div className="mb-8 p-4 bg-white/5 border border-[var(--f1-gray)]/30">
                       <div className="font-orbitron font-bold text-[10px] text-[var(--f1-red)] tracking-widest uppercase mb-3">TOP 3 FINISHERS</div>
                       <div className="flex gap-4">
                          {getPodium(selectedRace.round).map((code, idx) => (
                             <div key={code} className="flex-1 text-center">
                                <div className={`font-orbitron font-black text-xl ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-300" : "text-amber-600"}`}>
                                   {code}
                                </div>
                                <div className="font-mono text-[8px] text-[var(--f1-gray-light)]">{idx === 0 ? "P1" : idx === 1 ? "P2" : "P3"}</div>
                             </div>
                          ))}
                       </div>
                    </div>
                )}

                {/* Session Schedule */}
                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-2 text-white font-orbitron font-bold text-[11px] tracking-widest border-b border-[var(--f1-gray)]/30 pb-2">
                    <Clock size={14} className="text-[var(--f1-red)]" /> FULL WEEKEND SCHEDULE (UTC)
                  </div>

                  {[
                    { label: "PRACTICE 1", date: selectedRace.FirstPractice?.date, time: selectedRace.FirstPractice?.time },
                    { label: "PRACTICE 2", date: selectedRace.SecondPractice?.date, time: selectedRace.SecondPractice?.time },
                    { label: "PRACTICE 3", date: selectedRace.ThirdPractice?.date, time: selectedRace.ThirdPractice?.time },
                    { label: "QUALIFYING", date: selectedRace.Qualifying?.date, time: selectedRace.Qualifying?.time },
                    { label: "GRAND PRIX", date: selectedRace.date, time: selectedRace.time },
                  ].map((session) => (
                    <div key={session.label} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-8 bg-[var(--f1-gray)]/30 group-hover:bg-[var(--f1-red)] transition-colors" />
                        <div>
                          <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">{session.label}</div>
                          <div className="font-rajdhani font-bold text-base text-white">
                            {session.date ? new Date(session.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) : "TBA"}
                          </div>
                        </div>
                      </div>
                      <div className="font-orbitron font-bold text-sm text-[var(--f1-red)]">
                        {session.time ? session.time.slice(0, 5) : "TBA"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Intel */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--f1-gray)]/10 border border-[var(--f1-gray)]/30"
                    style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                    <div className="flex items-center gap-2 text-[var(--f1-gray-light)] font-mono text-[9px] mb-2">
                      <Cloud size={12} className="text-blue-400" /> FORECAST
                    </div>
                    <div className="font-orbitron font-bold text-sm text-white uppercase">28°C / DRY</div>
                  </div>
                  <div className="p-4 bg-[var(--f1-gray)]/10 border border-[var(--f1-gray)]/30"
                    style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}>
                    <div className="flex items-center gap-2 text-[var(--f1-gray-light)] font-mono text-[9px] mb-2">
                      <Ticket size={12} className="text-green-400" /> TICKETS
                    </div>
                    <div className="font-orbitron font-bold text-sm text-white uppercase">LIMITED</div>
                  </div>
                </div>

                <button className="w-full mt-8 py-4 bg-white text-black font-orbitron font-black text-xs tracking-[0.4em] hover:bg-[var(--f1-red)] hover:text-white transition-all uppercase"
                  style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}>
                  FULL CIRCUIT INTEL
                </button>
              </motion.div>
            ) : (
              <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-[var(--f1-gray)] opacity-40">
                <span className="font-mono text-[10px] tracking-[0.5em] uppercase">SELECT_RACE_FOR_INTEL</span>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
