"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { LiveDriver } from "@/types/f1";
import { getCircuitPath } from "@/lib/circuit-data";

interface TrackMapProps {
  drivers: LiveDriver[];
  circuitId?: string;
}

export function InteractiveTrackMap({ drivers, circuitId = "generic" }: TrackMapProps) {
  const circuit = useMemo(() => getCircuitPath(circuitId), [circuitId]);
  const TRACK_PATH = circuit.path;

  const driverPositions = useMemo(() => {
    return drivers.slice(0, 20).map((d, i) => {
      const progress = (1 - (i * 0.05)) % 1;
      return { ...d, progress };
    });
  }, [drivers]);

  return (
    <div className="card-base p-8 relative overflow-hidden h-[420px]" 
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 30px 100%, 0 calc(100% - 30px))" }}>
      
      <div className="absolute top-6 left-6 z-10">
        <div className="font-orbitron font-bold text-[10px] text-[var(--f1-red)] tracking-[0.4em] mb-1 uppercase">TRACK_POSITION_MAP</div>
        <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest uppercase">REAL_TIME_TELEMETRY_UPLINK</div>
      </div>

      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <div className="w-full h-full flex items-center justify-center relative z-0 mt-4">
        <svg viewBox="0 0 1000 600" className="w-full h-full max-h-[320px]">
          {/* Outer Glow */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="var(--f1-red)"
            strokeWidth="40"
            strokeLinecap="round"
            className="opacity-[0.02]"
          />

          {/* Track Surface (Blueprint style) */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="10 5"
            className="opacity-10"
          />
          
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="var(--f1-gray)"
            strokeWidth="20"
            strokeLinecap="round"
            className="opacity-5"
          />

          {/* S1, S2, S3 Split points */}
          {circuit.splitPoints.map((point) => (
            <SplitPoint key={point.label} x={point.x} y={point.y} label={point.label} />
          ))}

          {/* Driver Markers */}
          {driverPositions.map((d, i) => (
            <DriverMarker key={d.driverCode} driver={d} index={i} />
          ))}
        </svg>
      </div>

      {/* Legend / Status HUD */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
        <div className="flex gap-4">
          {drivers.slice(0, 3).map((d) => (
            <div key={d.driverCode} className="flex flex-col gap-1">
              <div className="h-0.5 w-8" style={{ backgroundColor: d.teamColor }} />
              <span className="font-mono text-[8px] text-white font-bold">{d.driverCode}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--f1-red)]/10 border border-[var(--f1-red)]/30">
          <span className="font-mono text-[8px] text-[var(--f1-red)] font-bold">GPS_ACCURACY: 99.8%</span>
        </div>
      </div>
    </div>
  );
}

function SplitPoint({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="4" fill="var(--f1-red)" className="opacity-40" />
      <text y="-10" textAnchor="middle" className="font-mono text-[10px] fill-[var(--f1-gray-light)] font-bold">{label}</text>
    </g>
  );
}

function DriverMarker({ driver, index }: { driver: LiveDriver & { progress: number }, index: number }) {
  const angle = (driver.progress * 2 * Math.PI) - Math.PI / 2;
  const rx = 400;
  const ry = 200;
  const cx = 500 + Math.cos(angle) * rx;
  const cy = 300 + Math.sin(angle) * ry;

  return (
    <motion.g
      animate={{ x: cx, y: cy }}
      transition={{ duration: 1, ease: "linear" }}
    >
      {/* Driver Pointer */}
      <motion.path
        d="M 0 -8 L 6 8 L -6 8 Z"
        fill={driver.teamColor}
        animate={{ rotate: (angle * 180 / Math.PI) + 90 }}
      />
      
      {/* Driver Tag */}
      <rect x="8" y="-8" width="28" height="16" fill="black" fillOpacity="0.8" stroke={driver.teamColor} strokeWidth="1" />
      <text
        x="22"
        y="4"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        className="font-orbitron"
      >
        {driver.driverCode}
      </text>

      {/* Lead car glow */}
      {index === 0 && (
        <circle r="20" fill={driver.teamColor} className="opacity-10 animate-pulse" />
      )}
    </motion.g>
  );
}
