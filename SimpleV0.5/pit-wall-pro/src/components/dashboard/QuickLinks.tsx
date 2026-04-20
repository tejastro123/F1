"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Radio, BarChart3, Repeat, Gamepad2, Brain, History, Mic, Users, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/live", label: "LIVE TRACK", icon: Radio, color: "var(--f1-red)", hot: true },
  { href: "/analysis", label: "TELEMETRY", icon: BarChart3, color: "var(--mclaren)" },
  { href: "/qualifying", label: "QUALIFYING", icon: Radio, color: "#FCD700" },
  { href: "/analytics", label: "ANALYTICS", icon: BarChart3, color: "var(--redbull)" },
  { href: "/strategy", label: "STRATEGY", icon: Repeat, color: "var(--mercedes)" },
  { href: "/championship", label: "WDC MATH", icon: History, color: "var(--aston)" },
  { href: "/history", label: "VAULT", icon: History, color: "var(--ferrari)" },
  { href: "/ai", label: "AI PREDICT", icon: Brain, color: "#A855F7" },
];

export function QuickLinks() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard size={14} className="text-[var(--f1-red)]" />
        <h2 className="font-orbitron font-bold text-[10px] text-white tracking-[0.3em] uppercase">
          OPERATIONAL NODES
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LINKS.map(({ href, label, icon: Icon, color, hot }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={href} className="group relative flex flex-col items-center justify-center p-4 border border-white/5 bg-white/[0.01] hover:border-[var(--f1-red)]/50 hover:bg-[var(--f1-red)]/[0.02] transition-all duration-300 aspect-square"
              style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
              
              {hot && (
                <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--f1-red)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--f1-red)]"></span>
                </span>
              )}

              <div className="mb-3 transition-transform group-hover:scale-110 duration-500">
                <Icon size={20} style={{ color }} className="opacity-80 group-hover:opacity-100" />
              </div>
              
              <div className="font-orbitron font-bold text-[8px] tracking-[0.2em] text-[var(--f1-gray-light)] group-hover:text-white text-center leading-tight transition-colors">
                {label}
              </div>

              {/* Decorative corner */}
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/5 group-hover:border-[var(--f1-red)]/30 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.2em] leading-relaxed">
          SECURE CHANNEL 04<br/>
          PIT-WALL-PRO-v0.5.2<br/>
          STATUS: <span className="text-[var(--f1-red)] uppercase">Active</span>
        </div>
      </div>
    </div>
  );
}

