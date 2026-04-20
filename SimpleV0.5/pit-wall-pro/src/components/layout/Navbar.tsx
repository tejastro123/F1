"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag, Gauge, Users, Building2, Trophy, History,
  Bell, Settings, Menu, X, Radio, ChevronRight,
  Gamepad2, Brain, Mic, BarChart3, Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/f1Store";
import { useLiveRaceStore } from "@/store/f1Store";

const NAV_ITEMS = [
  { href: "/", label: "DASHBOARD", icon: Gauge },
  { href: "/live", label: "LIVE RACE", icon: Radio, isLive: true },
  { href: "/drivers", label: "DRIVERS", icon: Users },
  { href: "/teams", label: "TEAMS", icon: Building2 },
  { href: "/analytics", label: "ANALYTICS", icon: BarChart3 },
  { href: "/strategy", label: "STRATEGY", icon: Repeat },
  { href: "/history", label: "HISTORY", icon: History },
  { href: "/fantasy", label: "FANTASY", icon: Gamepad2 },
  { href: "/ai", label: "AI INSIGHTS", icon: Brain },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount, isAuthenticated, profile } = useUserStore();
  const { isConnected } = useLiveRaceStore();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--f1-gray)]"
      style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[var(--f1-red)] flex items-center justify-center"
            style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}>
            <Flag size={14} className="text-white" />
          </div>
          <div>
            <div className="font-orbitron font-900 text-sm text-white tracking-wider leading-none">
              PIT WALL
            </div>
            <div className="font-mono text-[9px] text-[var(--f1-red)] tracking-widest">
              PRO · TEJAS
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, isLive }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-widest transition-all duration-200",
                  active
                    ? "text-white"
                    : "text-[var(--f1-gray-light)] hover:text-white"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-[var(--f1-red)] opacity-10"
                    style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
                  />
                )}
                {active && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--f1-red)]" />
                )}
                <Icon size={11} />
                {label}
                {isLive && isConnected && (
                  <span className="live-dot w-1.5 h-1.5 ml-0.5" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={cn(
            "hidden md:flex items-center gap-2 font-mono text-[9px] tracking-widest px-3 py-1.5 border",
            isConnected
              ? "text-green-400 border-green-400/30 bg-green-400/5"
              : "text-[var(--f1-gray-light)] border-[var(--f1-gray)]"
          )}
            style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}>
            <span className={cn("w-1.5 h-1.5 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-[var(--f1-gray)]"
            )} />
            {isConnected ? "LIVE" : "OFFLINE"}
          </div>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link href="/notifications" className="relative p-2 text-[var(--f1-gray-light)] hover:text-white transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-[var(--f1-red)] rounded-full font-mono text-[9px] flex items-center justify-center text-white font-bold"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </Link>

              {/* Voice Assistant */}
              <Link href="/voice" className="hidden md:flex p-2 text-[var(--f1-gray-light)] hover:text-white transition-colors">
                <Mic size={18} />
              </Link>

              {/* Settings / Profile */}
              <Link href="/settings" className="flex items-center gap-3 p-2 text-[var(--f1-gray-light)] hover:text-white transition-colors group">
                <div className="hidden lg:block text-right">
                  <div className="font-mono text-[10px] text-white tracking-widest uppercase">{profile.username}</div>
                  <div className="font-mono text-[8px] text-[var(--f1-red)] tracking-widest">PRO TIER</div>
                </div>
                <div className="w-8 h-8 rounded-full border border-[var(--f1-gray)] flex items-center justify-center group-hover:border-[var(--f1-red)] transition-all">
                  <Settings size={14} />
                </div>
              </Link>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="hidden md:flex items-center justify-center px-6 py-2 bg-[rgba(225,6,0,0.1)] border border-[var(--f1-red)] text-[var(--f1-red)] font-orbitron font-bold text-[10px] tracking-widest hover:bg-[var(--f1-red)] hover:text-white transition-all ml-2"
              style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
            >
              LOGIN / REGISTER
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2 text-[var(--f1-gray-light)] hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="xl:hidden border-t border-[var(--f1-gray)] overflow-hidden"
            style={{ background: "rgba(10,10,15,0.98)" }}
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon, isLive }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 font-mono text-[11px] tracking-widest border transition-all",
                      active
                        ? "text-white border-[var(--f1-red)] bg-[rgba(225,6,0,0.1)]"
                        : "text-[var(--f1-gray-light)] border-[var(--f1-gray)] hover:border-[var(--f1-red)] hover:text-white"
                    )}
                    style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} />
                      {label}
                    </div>
                    {isLive && isConnected && <span className="live-dot" />}
                    {!isLive && <ChevronRight size={12} />}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
