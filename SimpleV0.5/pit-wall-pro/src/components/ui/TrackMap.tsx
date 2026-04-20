"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Corner {
  number: string;
  x: number;
  y: number;
  angle: number;
}

interface TrackMapProps {
  x: number[];
  y: number[];
  speed?: number[];
  gear?: number[];
  corners?: Corner[];
  rotation?: number;
  loading?: boolean;
}

export function TrackMap({ x, y, speed, gear, corners, rotation = 0, loading }: TrackMapProps) {
  const points = useMemo(() => {
    if (!x.length || !y.length) return [];
    
    // Normalize coordinates
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);
    
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY);
    
    const scale = 400 / maxRange;
    const offsetX = (450 - (rangeX * scale)) / 2;
    const offsetY = (450 - (rangeY * scale)) / 2;
    
    return x.map((xv, i) => ({
      px: offsetX + (xv - minX) * scale,
      py: offsetY + (maxY - y[i]) * scale, // Flip Y for SVG
      speed: speed ? speed[i] : 0,
      gear: gear ? gear[i] : 0
    }));
  }, [x, y, speed, gear]);

  const pathData = useMemo(() => {
    if (!points.length) return "";
    return `M ${points[0].px} ${points[0].py} ` + points.slice(1).map(p => `L ${p.px} ${p.py}`).join(" ") + " Z";
  }, [points]);

  if (loading) {
    return (
      <div className="w-full aspect-square flex items-center justify-center border border-white/5 bg-white/[0.01]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--f1-red)] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[10px] text-[var(--f1-gray-light)] animate-pulse uppercase tracking-[0.2em]">Mapping Circuit Data...</span>
        </div>
      </div>
    );
  }

  if (!points.length) return null;

  return (
    <div className="relative w-full aspect-square bg-black/40 border border-white/10 overflow-hidden">
      <svg viewBox="0 0 450 450" className="w-full h-full p-8 overflow-visible">
        {/* Shadow Path */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="blur-md"
        />
        
        {/* Background Path */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated Track Path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="var(--f1-red)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Corners */}
        {corners?.map((corner, i) => {
          // Find closest point in telemetry to position the corner label
          // (This is a simplified approach, usually we'd use the corner X/Y directly but they need normalization too)
          const minX = Math.min(...x);
          const maxX = Math.max(...x);
          const minY = Math.min(...y);
          const maxY = Math.max(...y);
          const maxRange = Math.max(maxX - minX, maxY - minY);
          const scale = 400 / maxRange;
          const offsetX = (450 - ((maxX - minX) * scale)) / 2;
          const offsetY = (450 - ((maxY - minY) * scale)) / 2;

          const cx = offsetX + (corner.x - minX) * scale;
          const cy = offsetY + (maxY - corner.y) * scale;

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6" fill="#15151E" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text 
                x={cx} 
                y={cy} 
                dy="3"
                textAnchor="middle" 
                fill="white" 
                fontSize="6" 
                fontWeight="bold" 
                className="font-mono pointer-events-none"
              >
                {corner.number}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Track Overlay HUD */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-[var(--f1-gray-light)] uppercase tracking-widest bg-black/60 p-2 border border-white/5">
        Circuit Uplink: 100%<br/>
        Telemetry Sync: Active
      </div>
    </div>
  );
}
