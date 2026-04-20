"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStrategyStore } from "@/store/f1Store";
import type { TireCompound, Stint } from "@/types/f1";
import { getTireColor } from "@/lib/utils";
import { Repeat, Plus, Trash2, Zap } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COMPOUNDS: TireCompound[] = ["SOFT", "MEDIUM", "HARD"];
const COMPOUND_PACE: Record<TireCompound, number> = { SOFT: 1.0, MEDIUM: 0.3, HARD: -0.2, INTERMEDIATE: 0, WET: 0 };
const COMPOUND_LIFE: Record<TireCompound, number> = { SOFT: 22, MEDIUM: 32, HARD: 45, INTERMEDIATE: 30, WET: 25 };
const PIT_LOSS = 25; // seconds
const TOTAL_LAPS = 57;
const BASE_LAP_TIME = 95.5; // seconds

function simulateLapTimes(stints: Stint[]): { lap: number; time: number; compound: TireCompound }[] {
  const laps: { lap: number; time: number; compound: TireCompound }[] = [];
  let pitLoss = 0;
  let lapNum = 1;

  stints.forEach((stint, si) => {
    for (let i = 0; i < stint.laps && lapNum <= TOTAL_LAPS; i++, lapNum++) {
      const degradation = (i / COMPOUND_LIFE[stint.tireCompound]) * 3;
      const pace = BASE_LAP_TIME - COMPOUND_PACE[stint.tireCompound] + degradation + (si > 0 && i === 0 ? 0 : 0);
      const pitPenalty = si > 0 && i === 0 ? PIT_LOSS : 0;
      laps.push({ lap: lapNum, time: parseFloat((pace + pitPenalty * (i === 0 && si > 0 ? 0.1 : 0)).toFixed(3)), compound: stint.tireCompound });
    }
  });

  return laps;
}

export default function StrategyPage() {
  const [stints, setStints] = useState<Stint[]>([
    { lap: 1, tireCompound: "SOFT", laps: 20 },
    { lap: 21, tireCompound: "MEDIUM", laps: 37 },
  ]);
  const { addScenario } = useStrategyStore();
  const simData = simulateLapTimes(stints);

  const addStint = () => {
    const lastStint = stints[stints.length - 1];
    const startLap = lastStint.lap + lastStint.laps;
    if (startLap >= TOTAL_LAPS) return;
    setStints([...stints, { lap: startLap, tireCompound: "HARD", laps: TOTAL_LAPS - startLap + 1 }]);
  };

  const removeStint = (i: number) => setStints(stints.filter((_, idx) => idx !== i));

  const updateStint = (i: number, key: keyof Stint, value: unknown) => {
    setStints(stints.map((s, idx) => idx === i ? { ...s, [key]: value } : s));
  };

  const saveScenario = () => {
    addScenario({
      id: `strategy-${Date.now()}`,
      name: `Strategy ${stints.length}-stop`,
      stints,
      predictedFinish: 1,
      pitStopCount: stints.length - 1,
      estimatedRaceTime: "1:32:45",
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Repeat size={24} className="text-[var(--f1-red)]" />
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          RACE STRATEGY SIMULATOR
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="card-base overflow-hidden"
            style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)" }}>
            <div className="px-5 py-4 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
              <div className="font-orbitron font-bold text-sm text-white tracking-widest">STINT PLANNER</div>
              <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mt-1">
                {TOTAL_LAPS} LAPS · {stints.length - 1} STOP{stints.length !== 2 ? "S" : ""}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {stints.map((stint, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 border border-[var(--f1-gray)] bg-[var(--f1-darker)]"
                  style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest">
                      STINT {i + 1} {i === 0 ? "(START)" : `(LAP ${stint.lap})`}
                    </span>
                    {i > 0 && (
                      <button onClick={() => removeStint(i)} className="text-[var(--f1-gray-light)] hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] mb-2 tracking-widest">COMPOUND</div>
                      <div className="flex gap-1.5">
                        {COMPOUNDS.map(c => (
                          <button key={c}
                            onClick={() => updateStint(i, "tireCompound", c)}
                            className="w-7 h-7 rounded-full border-2 font-orbitron font-black text-[9px] flex items-center justify-center transition-all"
                            style={{
                              borderColor: getTireColor(c),
                              color: stint.tireCompound === c ? "#fff" : getTireColor(c),
                              background: stint.tireCompound === c ? getTireColor(c) : "transparent",
                            }}>
                            {c[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] mb-2 tracking-widest">LAPS</div>
                      <input
                        type="number"
                        value={stint.laps}
                        min={1}
                        max={TOTAL_LAPS}
                        onChange={e => updateStint(i, "laps", parseInt(e.target.value))}
                        className="w-full bg-[var(--f1-dark)] border border-[var(--f1-gray)] text-white font-orbitron font-bold text-lg px-3 py-1 text-center outline-none focus:border-[var(--f1-red)]"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              <button onClick={addStint}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[var(--f1-gray)] text-[var(--f1-gray-light)] hover:border-[var(--f1-red)] hover:text-white transition-all font-mono text-[11px] tracking-widest">
                <Plus size={14} /> ADD PIT STOP
              </button>

              <button onClick={saveScenario}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--f1-red)] text-white font-orbitron font-bold text-sm tracking-widest hover:bg-[var(--f1-red-bright)] transition-colors"
                style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
                <Zap size={16} /> SAVE SCENARIO
              </button>
            </div>
          </div>

          {/* Stint Summary */}
          <div className="card-base p-4">
            <div className="font-orbitron font-bold text-xs text-white tracking-widest mb-3">STRATEGY SUMMARY</div>
            <div className="space-y-2">
              {stints.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: getTireColor(s.tireCompound), background: `${getTireColor(s.tireCompound)}30` }} />
                    <span className="font-mono text-[10px] text-white tracking-widest">{s.tireCompound}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--f1-gray-light)]">{s.laps} laps</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card-base overflow-hidden"
          style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
          <div className="px-6 py-5 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
            <div className="font-orbitron font-bold text-base text-white tracking-widest">LAP TIME SIMULATION</div>
            <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mt-1">Predicted lap times including tire degradation</div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={simData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="lap" tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }} label={{ value: "LAP", position: "insideBottom", fill: "#8E8E93", fontSize: 10 }} />
                <YAxis tick={{ fill: "#8E8E93", fontSize: 10, fontFamily: "JetBrains Mono" }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#15151E", border: "1px solid #E10600", fontFamily: "JetBrains Mono", fontSize: 11 }}
                  formatter={(v: number) => [`${v.toFixed(3)}s`, "Lap Time"]}
                  labelFormatter={(l) => `LAP ${l}`}
                />
                <Line type="monotone" dataKey="time" stroke="var(--f1-red)" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: "var(--f1-red)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
