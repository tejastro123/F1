"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertTriangle, Flag, Wifi } from "lucide-react";

const MOCK_MESSAGES = [
  { id: 1, type: "SYSTEM", message: "DRS ENABLED", time: "14:32:01", priority: "low" },
  { id: 2, type: "INCIDENT", message: "YELLOW FLAG SECTOR 2 - CAR 18 (STR)", time: "14:33:15", priority: "high" },
  { id: 3, type: "SYSTEM", message: "TRACK LIMITS WARNING - CAR 1 (VER) TURN 4", time: "14:35:42", priority: "medium" },
  { id: 4, type: "INCIDENT", message: "GREEN FLAG SECTOR 2", time: "14:36:10", priority: "low" },
  { id: 5, type: "RACE_CONTROL", message: "INVESTIGATION: CAR 44 FOR LEAVING TRACK AND GAINING ADVANTAGE", time: "14:38:22", priority: "high" },
  { id: 6, type: "WEATHER", message: "RAIN EXPECTED IN 10 MINUTES", time: "14:40:05", priority: "medium" },
];

export function RaceControlFeed() {
  return (
    <div className="card-base flex flex-col h-full overflow-hidden" style={{ clipPath: "polygon(0 16px, 16px 0, 100% 0, 100% 100%, 0 100%)" }}>
      <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={14} className="text-[var(--f1-red)]" />
          <h3 className="font-orbitron font-bold text-[10px] text-white tracking-[0.3em] uppercase">COMMS_LOG</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--f1-red)] animate-pulse" />
          <span className="font-mono text-[8px] text-[var(--f1-red)] tracking-widest font-bold">SECURE_SYNC</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[rgba(13,13,13,0.4)]">
        <AnimatePresence mode="popLayout">
          {MOCK_MESSAGES.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 border border-white/5 relative overflow-hidden group ${
                msg.priority === 'high' ? 'bg-red-500/[0.03] border-red-500/20' : 
                msg.priority === 'medium' ? 'bg-yellow-500/[0.03] border-yellow-500/20' : 
                'bg-white/[0.01]'
              }`}
            >
              {/* Vertical priority indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                msg.priority === 'high' ? 'bg-red-500' : 
                msg.priority === 'medium' ? 'bg-yellow-500' : 
                'bg-white/10'
              }`} />
              
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-[8px] font-bold tracking-[0.2em] uppercase ${
                  msg.priority === 'high' ? 'text-red-400' : 
                  msg.priority === 'medium' ? 'text-yellow-400' : 
                  'text-[var(--f1-gray-light)]'
                }`}>
                  {msg.type}
                </span>
                <span className="font-mono text-[8px] text-[var(--f1-gray-light)] font-bold">{msg.time}</span>
              </div>
              
              <div className="flex items-start gap-3">
                {msg.priority === 'high' ? <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" /> : 
                 msg.type === 'WEATHER' ? <Wifi size={12} className="text-blue-400 shrink-0 mt-0.5" /> :
                 <Flag size={12} className="text-[var(--f1-gray-light)] shrink-0 mt-0.5" />}
                <p className="font-mono text-[10px] text-white leading-relaxed uppercase tracking-tight">
                  {msg.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="p-3 bg-[var(--f1-black)] border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono text-[8px] text-green-500 font-bold uppercase tracking-widest">UPLINK: 04_STABLE</span>
         </div>
         <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase tracking-widest">ENCRYPTION: AES</div>
      </div>
    </div>
  );
}
