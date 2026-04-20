"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Cpu, Wifi, Globe } from "lucide-react";

export function CommandCenterOverlay() {
  const [time, setTime] = useState(new Date());
  const [latency, setLatency] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const latTimer = setInterval(() => setLatency(Math.floor(Math.random() * 15) + 18), 3000);
    return () => {
      clearInterval(timer);
      clearInterval(latTimer);
    };
  }, []);

  return (
    <>
      {/* CRT Scanline Rows Overlay */}
      <div className="crt-rows" />

      {/* Persistent Engineering Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 border-b border-[var(--f1-red)] bg-[var(--f1-red)]" />
      
      {/* Top Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-1.5 flex items-center justify-between bg-[var(--f1-darker)]/80 backdrop-blur-md border-b border-[var(--f1-gray)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-[var(--f1-red)] animate-pulse" />
            <span className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              System: <span className="text-white">Active</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={10} className="text-green-500" />
            <span className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              Latency: <span className="text-white" suppressHydrationWarning>{latency}ms</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Cpu size={10} className="text-[var(--f1-red)]" />
            <span className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              Engine: <span className="text-white">Gen-X v4.2</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe size={10} className="text-[var(--f1-red)]" />
            <span className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              UTC: <span className="text-white" suppressHydrationWarning>{time.toISOString().split('T')[1].split('.')[0]}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={10} className="text-blue-400" />
            <span className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">
              Secure: <span className="text-white">Encrypted</span>
            </span>
          </div>
        </div>
      </div>

      {/* Side HUD Accents */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[90] flex flex-col gap-1 px-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-0.5 h-8 bg-[var(--f1-gray)]/30" />
        ))}
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] flex flex-col gap-1 px-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-0.5 h-8 bg-[var(--f1-gray)]/30" />
        ))}
      </div>

      {/* Bottom Status Ticker */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] h-6 bg-[var(--f1-black)] border-t border-[var(--f1-gray)] px-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4 flex-1">
          <span className="font-mono text-[9px] text-[var(--f1-red)] font-bold tracking-tighter">LIVE_DATA_STREAM</span>
          <div className="h-2 w-px bg-[var(--f1-gray)]" />
          <div className="flex-1 overflow-hidden">
             <motion.div 
               animate={{ x: [0, -1000] }}
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.2em] whitespace-nowrap uppercase"
             >
               FETCHING TELEMETRY SECTOR 1... DRS ENABLED... WIND 12KM/H... TRACK TEMP 34.2C... HUMIDITY 45%... PIT WINDOW OPEN L34-L38... 
               FETCHING TELEMETRY SECTOR 2... YELLOW FLAG SECTOR 2... DRIVER 44 PIT STOP IN 2 LAPS... STRATEGY B INITIATED...
             </motion.div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-4 bg-[var(--f1-black)]">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="font-mono text-[9px] text-white tracking-widest uppercase">SYNC_OK</span>
        </div>
      </div>
    </>
  );
}
