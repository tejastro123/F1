"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertTriangle, CheckCircle, Flag } from "lucide-react";

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
      <div className="px-4 py-3 border-b border-[var(--f1-gray)] bg-[rgba(255,255,255,0.02)] flex items-center gap-2">
        <MessageSquare size={14} className="text-[var(--f1-red)]" />
        <h3 className="font-orbitron font-bold text-[11px] text-white tracking-widest uppercase">RACE_CONTROL_FEED</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {MOCK_MESSAGES.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 border-l-2 relative overflow-hidden ${
                msg.priority === 'high' ? 'border-red-500 bg-red-500/5' : 
                msg.priority === 'medium' ? 'border-yellow-500 bg-yellow-500/5' : 
                'border-[var(--f1-gray)] bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {/* Background Glow for Priority */}
              {msg.priority === 'high' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-2xl -mr-8 -mt-8" />
              )}
              
              <div className="flex items-center justify-between mb-1.5">
                <span className={`font-mono text-[8px] font-bold tracking-widest uppercase ${
                  msg.priority === 'high' ? 'text-red-400' : 
                  msg.priority === 'medium' ? 'text-yellow-400' : 
                  'text-[var(--f1-gray-light)]'
                }`}>
                  {msg.type}
                </span>
                <span className="font-mono text-[8px] text-[var(--f1-gray-light)]">{msg.time}</span>
              </div>
              
              <div className="flex items-start gap-2">
                {msg.priority === 'high' ? <AlertTriangle size={12} className="text-red-500 mt-0.5" /> : 
                 msg.type === 'WEATHER' ? <Globe size={12} className="text-blue-400 mt-0.5" /> :
                 <Flag size={12} className="text-[var(--f1-gray-light)] mt-0.5" />}
                <p className="font-mono text-[10px] text-white leading-tight uppercase tracking-tight">
                  {msg.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="p-2 bg-[var(--f1-black)] border-t border-[var(--f1-gray)] flex items-center justify-between">
         <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="font-mono text-[8px] text-green-500 uppercase">CHANNEL_01_ACTIVE</span>
         </div>
         <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">PAGE 1/1</div>
      </div>
    </div>
  );
}

function Globe({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
