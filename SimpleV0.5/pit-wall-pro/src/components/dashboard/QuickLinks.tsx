"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, BarChart3, Repeat, Gamepad2, Brain, History, Mic, Users } from "lucide-react";

const LINKS = [
  { href: "/live", label: "LIVE RACE", sub: "Real-time tracking", icon: Radio, color: "var(--f1-red)", hot: true },
  { href: "/analytics", label: "ANALYTICS", sub: "Driver & team data", icon: BarChart3, color: "var(--mclaren)" },
  { href: "/strategy", label: "STRATEGY SIM", sub: "Race strategy builder", icon: Repeat, color: "var(--mercedes)" },
  { href: "/drivers", label: "DRIVERS", sub: "Full standings", icon: Users, color: "var(--ferrari)" },
  { href: "/ai", label: "AI INSIGHTS", sub: "Predictions & analysis", icon: Brain, color: "#A855F7" },
  { href: "/fantasy", label: "FANTASY F1", sub: "Build your team", icon: Gamepad2, color: "var(--redbull)" },
  { href: "/history", label: "HISTORY", sub: "Season comparison", icon: History, color: "var(--aston)" },
  { href: "/voice", label: "VOICE AI", sub: "Ask anything", icon: Mic, color: "var(--alpine)" },
];

export function QuickLinks() {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-orbitron font-bold text-lg text-white tracking-widest uppercase">
          QUICK ACCESS
        </h2>
        <div className="h-px flex-1 ml-6 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {LINKS.map(({ href, label, sub, icon: Icon, color, hot }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={href} className="group relative flex flex-col items-center gap-2 p-3 md:p-4 border border-[var(--f1-gray)] bg-[var(--f1-dark)] hover:border-[var(--f1-red)] transition-all duration-200 h-full"
              style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
              {hot && (
                <span className="absolute top-1.5 right-1.5 font-mono text-[8px] text-[var(--f1-red)] tracking-widest">LIVE</span>
              )}
              <div className="p-2 rounded-full" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="font-orbitron font-bold text-[9px] tracking-wider text-white text-center leading-tight">
                {label}
              </div>
              <div className="font-mono text-[8px] tracking-wide text-[var(--f1-gray-light)] text-center hidden md:block">
                {sub}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
