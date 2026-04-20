"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertTriangle, Flag, Car, Zap } from "lucide-react";
import { useUserStore } from "@/store/f1Store";
import type { Notification } from "@/types/f1";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  RACE_START: Flag,
  OVERTAKE: Car,
  PIT_STOP: Zap,
  SAFETY_CAR: AlertTriangle,
  RED_FLAG: AlertTriangle,
  FASTEST_LAP: Zap,
  CRASH: AlertTriangle,
  CHAMPIONSHIP_CHANGE: Bell,
  WEATHER: Bell,
};

const PRIORITY_COLORS = {
  low: "border-[var(--f1-gray)]",
  medium: "border-[var(--mercedes)]",
  high: "border-[var(--f1-red)]",
  critical: "border-[var(--f1-red)] animate-[borderGlow_1s_ease_infinite]",
};

function ToastItem({ notification }: { notification: Notification }) {
  const { markNotificationRead } = useUserStore();
  const Icon = ICON_MAP[notification.type] || Bell;

  useEffect(() => {
    const timer = setTimeout(() => {
      markNotificationRead(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, markNotificationRead]);

  return (
    <motion.div
      layout
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative flex items-start gap-3 p-4 max-w-[360px] w-full",
        "border-2 cursor-pointer",
        "bg-[var(--f1-dark)]",
        PRIORITY_COLORS[notification.priority]
      )}
      style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
      onClick={() => markNotificationRead(notification.id)}
    >
      {/* Left color bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        notification.priority === "critical" || notification.priority === "high"
          ? "bg-[var(--f1-red)]"
          : "bg-[var(--f1-gray)]"
      )} />

      <div className="shrink-0 mt-0.5">
        <Icon size={16} className={
          notification.priority === "critical" ? "text-[var(--f1-red)]"
          : notification.priority === "high" ? "text-[var(--f1-red)]"
          : "text-[var(--f1-gray-light)]"
        } />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-orbitron font-bold text-xs text-white tracking-wider mb-1">
          {notification.title}
        </div>
        <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-wider">
          {notification.message}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); markNotificationRead(notification.id); }}
        className="shrink-0 text-[var(--f1-gray-light)] hover:text-white transition-colors"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const { notifications } = useUserStore();
  const unread = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
      <AnimatePresence mode="popLayout">
        {unread.map((notification) => (
          <ToastItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
