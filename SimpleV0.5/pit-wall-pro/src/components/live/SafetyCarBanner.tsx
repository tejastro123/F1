"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SafetyCarStatus } from "@/types/f1";
import { AlertTriangle, XOctagon } from "lucide-react";

export function SafetyCarBanner({ status }: { status: SafetyCarStatus }) {
  if (status === "NONE") return null;

  const isRed = status === "RED_FLAG";
  const isVSC = status === "VIRTUAL_SAFETY_CAR";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`mb-6 flex items-center gap-4 px-6 py-4 border-2 ${
          isRed
            ? "border-red-500 bg-red-500/10 text-red-400"
            : isVSC
            ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
            : "border-orange-400 bg-orange-400/10 text-orange-400"
        }`}
        style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}
      >
        {isRed ? <XOctagon size={20} /> : <AlertTriangle size={20} />}
        <span className="font-orbitron font-black text-base tracking-widest animate-pulse">
          {isRed ? "🚩 RED FLAG — RACE SUSPENDED"
            : isVSC ? "🟡 VIRTUAL SAFETY CAR DEPLOYED"
            : "🟠 SAFETY CAR ON TRACK"}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
