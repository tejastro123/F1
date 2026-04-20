"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { LiveDriver } from "@/types/f1";

interface TrackMapProps {
  drivers: LiveDriver[];
}

// A simplified "Modern Circuit" SVG Path (Generic but looks professional)
const TRACK_PATH = "M 100 300 C 100 100 300 100 500 100 C 700 100 900 150 900 300 C 900 450 700 500 500 500 C 300 500 100 500 100 300 Z";

export function InteractiveTrackMap({ drivers }: TrackMapProps) {
  // Map drivers to positions on the track
  const driverPositions = useMemo(() => {
    return drivers.slice(0, 20).map((d, i) => {
      // Simulate progress along the track based on position and lap
      // In a real app, this would come from telemetry (x, y)
      const progress = (1 - (i * 0.05)) % 1;
      return {
        ...d,
        progress,
      };
    });
  }, [drivers]);

  return (
    <div className="card-base p-6 relative overflow-hidden h-[400px]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-orbitron font-bold text-xs text-white tracking-widest uppercase">TRACK_POSITION_MAP</h3>
        <p className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mt-1">REAL-TIME TELEMETRY OVERLAY</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span className="font-mono text-[8px] text-green-400">TRACK_CLEAR</span>
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center pt-8">
        <svg viewBox="0 0 1000 600" className="w-full h-full max-h-[300px]">
          {/* Track Glow */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="var(--f1-red)"
            strokeWidth="30"
            strokeLinecap="round"
            style={{ opacity: 0.05, filter: "blur(10px)" }}
          />

          {/* Track Surface */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="#1c1c28"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Track Outline */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="var(--f1-gray)"
            strokeWidth="22"
            strokeLinecap="round"
            style={{ opacity: 0.2 }}
          />

          {/* Sector Lines (Simulated) */}
          <circle cx="500" cy="100" r="12" fill="var(--f1-red)" opacity="0.3" />
          <circle cx="900" cy="300" r="12" fill="var(--f1-red)" opacity="0.3" />
          <circle cx="100" cy="300" r="12" fill="var(--f1-red)" opacity="0.3" />

          {/* Driver Markers */}
          {driverPositions.map((d, i) => (
            <motion.g
              key={d.driverCode}
              initial={false}
              animate={{
                // In a real implementation with x,y this would be simple
                // Here we use a CSS motion path or manual calculation
              }}
            >
              <DriverMarker driver={d} index={i} />
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 flex-wrap">
        {drivers.slice(0, 5).map((d) => (
          <div key={d.driverCode} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: d.teamColor }} />
            <span className="font-mono text-[8px] text-white">{d.driverCode}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriverMarker({ driver, index }: { driver: LiveDriver & { progress: number }, index: number }) {
  // Calculate position along the mock path manually for this demonstration
  // This is a rough approximation of the SVG path above
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
      <circle r="12" fill={driver.teamColor} stroke="white" strokeWidth="2" />
      <text
        y="4"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="Rajdhani"
      >
        {driver.driverCode}
      </text>

      {/* Speed Vector Indicator */}
      {index < 3 && (
        <line
          x1="0"
          y1="0"
          x2="20"
          y2="0"
          stroke={driver.teamColor}
          strokeWidth="2"
          transform={`rotate(${angle * 180 / Math.PI})`}
        />
      )}
    </motion.g>
  );
}
