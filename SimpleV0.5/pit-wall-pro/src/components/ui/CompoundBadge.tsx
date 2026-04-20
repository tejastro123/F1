"use client";

import React from "react";
import { getTireColor } from "@/lib/driver-colors";
import { cn } from "@/lib/utils";

interface CompoundBadgeProps {
  compound: string;
  className?: string;
  showText?: boolean;
}

export function CompoundBadge({ compound, className, showText = true }: CompoundBadgeProps) {
  const color = getTireColor(compound);
  const letter = compound.charAt(0).toUpperCase();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center font-orbitron font-black text-[9px] shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ 
          borderColor: color, 
          color: color,
          background: "rgba(0,0,0,0.4)"
        }}
      >
        {letter}
      </div>
      {showText && (
        <span className="font-mono text-[10px] text-white tracking-widest uppercase">
          {compound}
        </span>
      )}
    </div>
  );
}
