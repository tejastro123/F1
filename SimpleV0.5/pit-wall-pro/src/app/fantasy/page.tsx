"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFantasyStore, useF1Store } from "@/store/f1Store";
import { getTeamColor } from "@/lib/utils";
import { Gamepad2, Trophy, Users, Building2, Check, Target, Brain, Save, Zap, Flag, Star, Flame, TrendingDown, Zap as ZapIcon } from "lucide-react";
import type { FantasyTeam } from "@/types/f1";

type PredKey = "p1" | "p2" | "p3" | "pole" | "dotd" | "goodSurprise" | "badRace" | "sprintPole" | "sprintWin" | "fastest";

interface PredCategory {
  key: PredKey;
  label: string;
  sublabel: string;
  color: string;
  isSprint?: boolean;
}

const PRED_CATEGORIES: PredCategory[] = [
  { key: "p1",          label: "🏆 RACE WINNER",      sublabel: "P1",           color: "#FCD700" },
  { key: "p2",          label: "🥈 SECOND PLACE",     sublabel: "P2",           color: "#C0C0C0" },
  { key: "p3",          label: "🥉 THIRD PLACE",      sublabel: "P3",           color: "#CD7F32" },
  { key: "pole",        label: "⚡ POLE POSITION",    sublabel: "QUALIFYING",   color: "#27F4D2" },
  { key: "dotd",        label: "⭐ DRIVER OF DAY",   sublabel: "VOTED",        color: "#FF8700" },
  { key: "goodSurprise",label: "🚀 GOOD SURPRISE",   sublabel: "OVERPERFORM",  color: "#4ADE80" },
  { key: "badRace",     label: "💥 BAD RACE",        sublabel: "UNDERPERFORM", color: "#F87171" },
  { key: "sprintPole",  label: "🏁 SPRINT POLE",     sublabel: "SPRINT QUAL",  color: "#A78BFA", isSprint: true },
  { key: "sprintWin",   label: "⚡ SPRINT WIN",      sublabel: "SPRINT RACE",  color: "#818CF8", isSprint: true },
  { key: "fastest",     label: "💜 FASTEST LAP",     sublabel: "FASTEST",      color: "#C084FC" },
];

const MOCK_LEADERBOARD: FantasyTeam[] = [
  { id: "1", userId: "tejas", teamName: "VERSTAPPEN NATION", drivers: ["verstappen", "norris"], constructor: "red_bull", totalPoints: 1840, weeklyPoints: 245, rank: 1 },
  { id: "2", userId: "user2", teamName: "SCUDERIA FANTASY", drivers: ["leclerc", "sainz"], constructor: "ferrari", totalPoints: 1720, weeklyPoints: 198, rank: 2 },
  { id: "3", userId: "user3", teamName: "PAPAYA DREAMS", drivers: ["norris", "piastri"], constructor: "mclaren", totalPoints: 1680, weeklyPoints: 312, rank: 3 },
  { id: "4", userId: "user4", teamName: "SILVER ARROWS FC", drivers: ["russell", "hamilton"], constructor: "mercedes", totalPoints: 1590, weeklyPoints: 167, rank: 4 },
  { id: "5", userId: "user5", teamName: "TIFOSI FANTASY", drivers: ["leclerc", "hamilton"], constructor: "ferrari", totalPoints: 1540, weeklyPoints: 203, rank: 5 },
];

export default function FantasyPage() {
  const { driverStandings } = useF1Store();
  const { myTeam, setMyTeam } = useFantasyStore();
  
  const [activeTab, setActiveTab] = useState<"TEAM" | "PREDICTIONS">("TEAM");

  // Team Builder State
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(myTeam?.drivers || []);
  const [selectedCtor, setSelectedCtor] = useState(myTeam?.constructor || "");
  const [teamName, setTeamName] = useState(myTeam?.teamName || "MY FANTASY TEAM");
  const [teamSaved, setTeamSaved] = useState(false);

  // Predictions State
  const emptyPreds = (): Record<PredKey, string> => ({ p1:"", p2:"", p3:"", pole:"", dotd:"", goodSurprise:"", badRace:"", sprintPole:"", sprintWin:"", fastest:"" });
  const [predictions, setPredictions] = useState<Record<PredKey, string>>(
    (myTeam?.predictions as Record<PredKey, string>) || emptyPreds()
  );
  const [mlPredictions, setMlPredictions] = useState<Record<PredKey, string> | null>(null);
  const [isGeneratingML, setIsGeneratingML] = useState(false);
  const [predSaved, setPredSaved] = useState(false);

  // Derive unique constructors from driver standings
  const constructorsMap = new Map();
  driverStandings.forEach(d => {
    const ctor = d.Constructors[0];
    if (ctor && !constructorsMap.has(ctor.constructorId)) {
      constructorsMap.set(ctor.constructorId, ctor);
    }
  });
  const constructors = Array.from(constructorsMap.values());

  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const saveTeam = () => {
    setMyTeam({
      id: "my-team",
      userId: "tejas",
      teamName,
      drivers: selectedDrivers,
      constructor: selectedCtor,
      totalPoints: myTeam?.totalPoints || 0,
      weeklyPoints: myTeam?.weeklyPoints || 0,
      rank: myTeam?.rank || 0,
      predictions: predictions
    });
    setTeamSaved(true);
    setTimeout(() => setTeamSaved(false), 2000);
  };

  const updatePrediction = (key: PredKey, driverId: string) => {
    setPredictions(prev => ({ ...prev, [key]: driverId }));
  };

  const filledCount = Object.values(predictions).filter(Boolean).length;

  const savePredictions = () => {
    setMyTeam({
      ...(myTeam || {
        id: "my-team", userId: "tejas", teamName, drivers: selectedDrivers, constructor: selectedCtor, totalPoints: 0, weeklyPoints: 0, rank: 0
      }),
      predictions
    });
    setPredSaved(true);
    setTimeout(() => setPredSaved(false), 2000);
  };

  const generateMLPrediction = () => {
    setIsGeneratingML(true);
    setTimeout(() => {
      const pool = [...driverStandings];
      const pick = (offset = 0) => {
        const idx = Math.min(offset + Math.floor(Math.random() * 3), pool.length - 1);
        return pool[idx]?.Driver.driverId ?? "";
      };
      setMlPredictions({
        p1: pick(0), p2: pick(1), p3: pick(2),
        pole: pick(0),
        dotd: pick(2),
        goodSurprise: pick(8),
        badRace: pick(3),
        sprintPole: pick(0),
        sprintWin: pick(1),
        fastest: pick(1),
      });
      setIsGeneratingML(false);
    }, 1500);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Gamepad2 size={24} className="text-[var(--f1-red)]" />
          <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
            FANTASY & PREDICTIONS
          </h1>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-[var(--f1-gray)] p-1"
             style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
          <button onClick={() => setActiveTab("TEAM")}
            className={`px-6 py-2 font-orbitron font-bold text-xs tracking-widest transition-all ${activeTab === "TEAM" ? "bg-[var(--f1-red)] text-white" : "text-[var(--f1-gray-light)] hover:text-white"}`}
            style={{ clipPath: activeTab === "TEAM" ? "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" : "none" }}>
            FANTASY TEAM
          </button>
          <button onClick={() => setActiveTab("PREDICTIONS")}
            className={`px-6 py-2 font-orbitron font-bold text-xs tracking-widest transition-all ${activeTab === "PREDICTIONS" ? "bg-[var(--f1-red)] text-white" : "text-[var(--f1-gray-light)] hover:text-white"}`}
            style={{ clipPath: activeTab === "PREDICTIONS" ? "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" : "none" }}>
            RACE PREDICTOR
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "TEAM" ? (
          <motion.div key="team" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            {/* Team Builder */}
            <div className="space-y-5">
              <div className="card-base overflow-hidden"
                style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
                <div className="px-6 py-5 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
                  <div className="font-orbitron font-bold text-base text-white tracking-widest">BUILD YOUR TEAM</div>
                  <div className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mt-1">
                    SELECT 2 DRIVERS + 1 CONSTRUCTOR
                  </div>
                </div>

                <div className="p-5">
                  {/* Team Name */}
                  <div className="mb-5">
                    <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-2">TEAM NAME</label>
                    <input
                      value={teamName}
                      onChange={e => setTeamName(e.target.value.toUpperCase())}
                      className="w-full bg-[var(--f1-darker)] border border-[var(--f1-gray)] text-white font-orbitron font-bold text-base px-4 py-3 outline-none focus:border-[var(--f1-red)] tracking-wider"
                      style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
                    />
                  </div>

                  {/* Driver Selection */}
                  <div className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest mb-3 flex items-center gap-2">
                    <Users size={12} /> DRIVERS ({selectedDrivers.length}/2)
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-8">
                    {driverStandings.map(d => {
                      const color = getTeamColor(d.Constructors[0]?.constructorId || "");
                      const selected = selectedDrivers.includes(d.Driver.driverId);
                      return (
                        <button key={d.Driver.driverId}
                          onClick={() => toggleDriver(d.Driver.driverId)}
                          className="relative p-3 border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? color : "var(--f1-gray)",
                            background: selected ? `${color}15` : "var(--f1-darker)",
                            clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)"
                          }}>
                          {selected && (
                            <div className="absolute top-2 right-2">
                              <Check size={12} style={{ color }} />
                            </div>
                          )}
                          <div className="font-orbitron font-bold text-sm" style={{ color }}>{d.Driver.code}</div>
                          <div className="font-mono text-[9px] text-[var(--f1-gray-light)] truncate">{d.Driver.familyName}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Constructor Selection */}
                  <div className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest mb-3 flex items-center gap-2">
                    <Building2 size={12} /> CONSTRUCTOR ({selectedCtor ? 1 : 0}/1)
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
                    {constructors.map(c => {
                      const color = getTeamColor(c.constructorId);
                      const selected = selectedCtor === c.constructorId;
                      return (
                        <button key={c.constructorId}
                          onClick={() => setSelectedCtor(c.constructorId)}
                          className="relative p-3 border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? color : "var(--f1-gray)",
                            background: selected ? `${color}15` : "var(--f1-darker)",
                            clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)"
                          }}>
                          {selected && (
                            <div className="absolute top-2 right-2">
                              <Check size={12} style={{ color }} />
                            </div>
                          )}
                          <div className="font-orbitron font-bold text-sm" style={{ color }}>{c.name.toUpperCase()}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Save Button */}
                  <button onClick={saveTeam}
                    disabled={selectedDrivers.length !== 2 || !selectedCtor}
                    className="w-full py-4 bg-[var(--f1-red)] text-white font-orbitron font-black text-sm tracking-widest hover:bg-[var(--f1-red-bright)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}>
                    <Save size={16} />
                    {teamSaved ? "TEAM SAVED!" : "CONFIRM FANTASY TEAM"}
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <div className="card-base overflow-hidden"
                style={{ clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)" }}>
                <div className="px-5 py-4 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)]">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-[var(--f1-red)]" />
                    <div className="font-orbitron font-bold text-sm text-white tracking-widest">LEAGUE LEADERBOARD</div>
                  </div>
                </div>
                {MOCK_LEADERBOARD.map((team, i) => (
                  <div key={team.id}
                    className="flex items-center gap-3 px-5 py-4 border-b border-[var(--f1-gray)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <div className="font-orbitron font-black text-xl w-8"
                      style={{ color: i === 0 ? "#FCD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#fff" }}>
                      {team.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-rajdhani font-bold text-sm text-white uppercase">{team.teamName}</div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">
                        +{team.weeklyPoints} THIS WEEK
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-orbitron font-bold text-lg text-white">{team.totalPoints.toLocaleString()}</div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest">PTS</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="predictions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* User Predictions */}
            <div className="card-base overflow-hidden" style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
              <div className="px-6 py-5 border-b border-[var(--f1-gray)] bg-[rgba(255,255,255,0.02)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-400" />
                  <div className="font-orbitron font-bold text-base text-white tracking-widest">YOUR PREDICTIONS</div>
                </div>
                <div className="font-mono text-[10px] text-blue-400 tracking-widest">{filledCount}/10 FILLED</div>
              </div>
              <div className="p-5 space-y-2">
                {PRED_CATEGORIES.map(cat => {
                  const selectedId = predictions[cat.key];
                  const driver = driverStandings.find(d => d.Driver.driverId === selectedId);
                  const teamColor = getTeamColor(driver?.Constructors[0]?.constructorId || "");
                  return (
                    <div key={cat.key} className="flex items-center gap-3">
                      <div className="w-28 shrink-0">
                        <div className="font-orbitron font-black text-[10px] tracking-wider" style={{ color: cat.color }}>{cat.label}</div>
                        {cat.isSprint && <div className="font-mono text-[8px] tracking-widest" style={{ color: cat.color }}>SPRINT WEEKEND</div>}
                      </div>
                      <select
                        value={selectedId || ""}
                        onChange={e => updatePrediction(cat.key, e.target.value)}
                        className="flex-1 appearance-none border-2 text-white font-rajdhani font-bold text-sm px-3 py-2 outline-none transition-all cursor-pointer"
                        style={{
                          clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
                          borderColor: selectedId ? teamColor : cat.color + "60",
                          background: selectedId ? `${teamColor}18` : "var(--f1-darker)"
                        }}
                      >
                        <option value="" className="bg-[var(--f1-dark)]">— SELECT DRIVER —</option>
                        {driverStandings.map(d => (
                          <option key={d.Driver.driverId} value={d.Driver.driverId} className="bg-[var(--f1-dark)]">
                            {d.Driver.code} — {d.Driver.familyName}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
                <button onClick={savePredictions}
                  className="w-full mt-4 py-3 bg-blue-600 text-white font-orbitron font-black text-sm tracking-widest hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                  style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}>
                  <Save size={14} />
                  {predSaved ? "✓ PREDICTIONS SAVED!" : "LOCK IN PREDICTIONS"}
                </button>
              </div>
            </div>

            {/* ML Predictor */}
            <div className="card-base overflow-hidden relative" style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)", borderColor: "#A855F740" }}>
              {isGeneratingML && (
                <div className="absolute inset-0 z-10 bg-[var(--f1-dark)]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Brain size={48} className="text-purple-500" />
                  </motion.div>
                  <div className="font-orbitron font-bold text-white tracking-widest mt-4">GEMINI COMPUTING...</div>
                  <div className="font-mono text-[10px] text-purple-400 mt-1 tracking-widest">ANALYZING TELEMETRY & PACE</div>
                </div>
              )}
              <div className="px-6 py-5 border-b border-[var(--f1-gray)] bg-[rgba(168,85,247,0.05)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-purple-500" />
                  <div className="font-orbitron font-bold text-base text-white tracking-widest">ML PREDICTOR</div>
                </div>
                <button onClick={generateMLPrediction} disabled={isGeneratingML}
                  className="flex items-center gap-1 font-mono text-[9px] text-purple-400 border border-purple-500/50 px-2 py-1 hover:bg-purple-500/20 transition-all"
                  style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}>
                  <Zap size={10} /> GENERATE
                </button>
              </div>
              <div className="p-5 space-y-2">
                {mlPredictions === null && !isGeneratingML ? (
                  <div className="py-20 text-center text-[var(--f1-gray-light)] font-mono text-xs tracking-widest">CLICK GENERATE TO RUN ML MODEL</div>
                ) : (
                  PRED_CATEGORIES.map((cat, i) => {
                    const driverId = mlPredictions?.[cat.key] ?? "";
                    const driver = driverStandings.find(d => d.Driver.driverId === driverId);
                    const teamColor = getTeamColor(driver?.Constructors[0]?.constructorId || "");
                    const userMatch = predictions[cat.key] === driverId && !!driverId;
                    return (
                      <motion.div key={cat.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3">
                        <div className="w-28 shrink-0">
                          <div className="font-orbitron font-black text-[10px] tracking-wider" style={{ color: cat.color }}>{cat.label}</div>
                        </div>
                        <div className="flex-1 border-2 px-3 py-2 flex items-center justify-between"
                          style={{
                            clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
                            borderColor: driver ? teamColor : cat.color + "40",
                            background: driver ? `${teamColor}18` : "var(--f1-darker)"
                          }}>
                          {driver ? (
                            <span className="font-orbitron font-bold text-sm text-white">{driver.Driver.code} <span className="font-rajdhani font-normal text-[var(--f1-gray-light)]">{driver.Driver.familyName}</span></span>
                          ) : (
                            <span className="font-mono text-[10px] text-[var(--f1-gray-light)]">—</span>
                          )}
                          {userMatch && <div className="font-mono text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 border border-green-500/50 shrink-0">✓ MATCH</div>}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
