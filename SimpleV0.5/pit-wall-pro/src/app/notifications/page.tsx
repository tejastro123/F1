"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, CheckCircle2, AlertCircle, Info, Clock, Check } from "lucide-react";
import { useUserStore } from "@/store/f1Store";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead, clearNotifications } = useUserStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
      >
        <div>
          <h1 className="font-orbitron font-bold text-3xl text-white tracking-widest flex items-center gap-3 drop-shadow-md">
            <div className="p-2 bg-[var(--f1-red)]/20 rounded-lg relative">
              <Bell className="text-[var(--f1-red)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--f1-red)] rounded-full animate-pulse" />
              )}
            </div>
            SYSTEM ALERTS
          </h1>
          <p className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest mt-2 ml-14">
            LIVE TELEMETRY · RACE UPDATES · SYSTEM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-5 py-3 font-mono text-[10px] text-white border border-[var(--f1-gray)] hover:border-white transition-all disabled:opacity-30 disabled:hover:border-[var(--f1-gray)] group relative overflow-hidden"
            style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
          >
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <Check size={12} className={unreadCount > 0 ? "text-green-400" : ""} /> MARK ALL READ
            </span>
          </button>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="px-5 py-3 font-mono text-[10px] text-[var(--f1-red)] border border-[var(--f1-red)]/30 hover:bg-[var(--f1-red)]/10 transition-all flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-transparent relative overflow-hidden group"
            style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
          >
            <div className="absolute inset-0 bg-[var(--f1-red)]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Trash2 size={12} className="relative z-10" /> 
            <span className="relative z-10">CLEAR LOGS</span>
          </button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-24 text-center border border-[var(--f1-gray)]/50 bg-[rgba(10,10,15,0.5)] backdrop-blur-sm relative overflow-hidden"
              style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--f1-gray)] opacity-[0.03] blur-3xl rounded-full" />
              <Bell size={48} className="mx-auto mb-6 text-[var(--f1-gray)] opacity-50" />
              <h3 className="font-orbitron font-bold text-lg text-white tracking-widest mb-2">SYSTEM CLEAR</h3>
              <p className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest max-w-[300px] mx-auto">
                No active alerts or telemetry updates at this time.
              </p>
            </motion.div>
          ) : (
            notifications.map((notif, idx) => {
              const Icon = notif.type === "info" ? Info :
                           notif.type === "warning" ? AlertCircle :
                           notif.type === "error" ? AlertCircle : CheckCircle2;
                           
              const colorClass = notif.type === "info" ? "text-blue-400" :
                                 notif.type === "warning" ? "text-yellow-400" :
                                 notif.type === "error" ? "text-[var(--f1-red)]" : "text-green-400";
              
              const borderClass = notif.type === "info" ? "border-blue-400/30" :
                                  notif.type === "warning" ? "border-yellow-400/30" :
                                  notif.type === "error" ? "border-[var(--f1-red)]/30" : "border-green-400/30";

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                  className={cn(
                    "relative p-5 border transition-all duration-300 group overflow-hidden",
                    notif.read 
                      ? "bg-[rgba(255,255,255,0.02)] border-[var(--f1-gray)] opacity-60" 
                      : `bg-[rgba(10,10,15,0.8)] border-l-2 cursor-pointer backdrop-blur-md shadow-lg ${borderClass}`,
                    !notif.read && notif.type === "error" ? "border-l-[var(--f1-red)]" : "",
                    !notif.read && notif.type === "warning" ? "border-l-yellow-400" : "",
                    !notif.read && notif.type === "info" ? "border-l-blue-400" : "",
                    !notif.read && notif.type === "success" ? "border-l-green-400" : ""
                  )}
                  style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
                >
                  {/* Hover Gradient Background */}
                  {!notif.read && (
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none",
                      notif.type === "error" ? "bg-[var(--f1-red)]" :
                      notif.type === "warning" ? "bg-yellow-400" :
                      notif.type === "info" ? "bg-blue-400" : "bg-green-400"
                    )} />
                  )}

                  <div className="flex gap-5 relative z-10">
                    <div className={cn("mt-1", colorClass)}>
                      <Icon size={18} />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <span className={cn(
                          "font-orbitron font-bold text-[12px] tracking-widest uppercase",
                          notif.read ? "text-[var(--f1-gray-light)]" : "text-white"
                        )}>
                          {notif.title}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--f1-gray-light)] uppercase shrink-0">
                          <Clock size={10} />
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {!notif.read && (
                            <span className="ml-2 w-1.5 h-1.5 rounded-full bg-[var(--f1-red)] animate-pulse" />
                          )}
                        </span>
                      </div>
                      <p className={cn(
                        "font-mono text-[12px] leading-relaxed transition-colors",
                        notif.read ? "text-[var(--f1-gray-light)]" : "text-gray-300 group-hover:text-white"
                      )}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
