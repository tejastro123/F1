"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFastF1, DriverTelemetry, ComparisonData, LapData, TrackMapData } from "@/hooks/useFastF1";
import { useSessionStore } from "@/store/sessionStore";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from "recharts";
import { 
  Activity, Zap, Search, ChevronRight, 
  BarChart3, Thermometer, Clock, Gauge, Map as MapIcon, Layers, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDriverColor, getTireColor } from "@/lib/driver-colors";
import { SessionSelector } from "@/components/ui/SessionSelector";
import { CompoundBadge } from "@/components/ui/CompoundBadge";
import { TrackMap } from "@/components/ui/TrackMap";

interface SessionResult {
  position: number | null;
  driver_number: string;
  driver_code: string;
  team: string;
  status: string;
  points: number;
  full_name: string;
}

interface SessionData {
  session_name: string;
  location: string;
  results: SessionResult[];
}

export default function AnalysisPage() {
  const { 
    getSession, getTelemetry, getComparison, getLaps, getTrackMap,
    loading, error 
  } = useFastF1();
  
  const { year, event, sessionType } = useSessionStore();
  
  const [activeTab, setActiveTab] = useState<"speed" | "track" | "laps" | "pedals" | "comparison">("speed");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [compareDriver, setCompareDriver] = useState<string | null>(null);
  
  // Data States
  const [telemetry, setTelemetry] = useState<DriverTelemetry | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [allLaps, setAllLaps] = useState<LapData[]>([]);
  const [trackData, setTrackData] = useState<TrackMapData | null>(null);

  // Initial Load & Session Sync
  useEffect(() => {
    async function loadSession() {
      const data = await getSession(year, event, sessionType);
      if (data) {
        setSessionData(data);
        if (data.results?.length > 0 && !selectedDriver) {
          setSelectedDriver(data.results[0].driver_code);
        }
      }
    }
    loadSession();
  }, [year, event, sessionType, getSession]);

  // Load Data based on Tab and Driver
  useEffect(() => {
    if (!selectedDriver) return;

    async function loadTabData() {
      const driverId = selectedDriver as string;

      if (activeTab === "speed" || activeTab === "pedals") {
        const data = await getTelemetry(year, event, sessionType, driverId);
        setTelemetry(data);
      } else if (activeTab === "track") {
        const data = await getTrackMap(year, event, sessionType, driverId);
        setTrackData(data);
      } else if (activeTab === "laps" && allLaps.length === 0) {
        const data = await getLaps(year, event, sessionType);
        setAllLaps(data || []);
      } else if (activeTab === "comparison" && compareDriver) {
        const data = await getComparison(year, event, sessionType, driverId, compareDriver);
        setComparisonData(data);
      }
    }
    loadTabData();
  }, [activeTab, selectedDriver, compareDriver, year, event, sessionType, getTelemetry, getTrackMap, getLaps, getComparison]);

  // Formatted Telemetry for Recharts
  const chartData = useMemo(() => {
    if (!telemetry?.telemetry) return [];
    const t = telemetry.telemetry;
    return t.time.map((time: number, i: number) => ({
      time: time.toFixed(2),
      speed: t.speed[i],
      rpm: t.rpm[i],
      throttle: t.throttle[i],
      brake: t.brake[i],
      gear: t.gear[i],
    }));
  }, [telemetry]);

  // Formatted Comparison for Recharts
  const compChartData = useMemo(() => {
    if (!comparisonData || !comparisonData.delta) return [];
    return comparisonData.ref_distance.map((dist: number, i: number) => ({
      distance: Math.round(dist),
      [comparisonData.d1.name]: comparisonData.d1.speed[i],
      [comparisonData.d2.name]: comparisonData.d2.speed[i],
      delta: comparisonData.delta[i],
    }));
  }, [comparisonData]);

  const gearColorMap = (gear: number) => {
    const colors = ["#8E8E93", "#3b82f6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#a855f7", "#ec4899", "#ffffff"];
    return colors[gear] || "#ffffff";
  };

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Header HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold uppercase animate-pulse">Telemetry_Link_Established</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase italic">
            Telemetry_<span className="text-[var(--f1-red)]">Lab</span>
          </h1>
        </div>

        <SessionSelector />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column - Driver Feed */}
        <div className="xl:col-span-3 space-y-6">
          <div className="card-base" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}>
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <h3 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">Driver_Feed</h3>
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full bg-green-500", loading && "animate-ping")} />
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-tighter">Sync_Live</span>
              </div>
            </div>
            
            <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
              {sessionData?.results.map((res) => (
                <button
                  key={res.driver_code}
                  onClick={() => {
                    if (activeTab === "comparison") {
                      if (selectedDriver === res.driver_code) return;
                      setCompareDriver(res.driver_code);
                    } else {
                      setSelectedDriver(res.driver_code);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-all text-left group",
                    (selectedDriver === res.driver_code || compareDriver === res.driver_code) && "bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-8" style={{ backgroundColor: getDriverColor(res.driver_code) }} />
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white uppercase flex items-center gap-2">
                        {res.driver_code}
                        {selectedDriver === res.driver_code && <span className="text-[8px] px-1 bg-[var(--f1-red)] text-white font-black tracking-tighter">REF</span>}
                        {compareDriver === res.driver_code && <span className="text-[8px] px-1 bg-blue-500 text-white font-black tracking-tighter">CMP</span>}
                      </div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase truncate max-w-[120px]">{res.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-orbitron font-black text-sm text-white/20 group-hover:text-white transition-colors">P{res.position}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card-base p-6 border-l-2 border-l-[var(--f1-red)]">
            <h4 className="font-orbitron font-bold text-[9px] text-white tracking-widest uppercase mb-4">Tactical_Intelligence</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">Live Weather</span>
                <span className="font-mono text-[8px] text-white uppercase font-bold">DRY | 28°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">Track Status</span>
                <span className="font-mono text-[8px] text-green-500 uppercase font-bold">GREEN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Lab Interface */}
        <div className="xl:col-span-9 space-y-6">
          {/* Lab Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {[
              { id: "speed", label: "Speed Trace", icon: Activity },
              { id: "track", label: "Track Map", icon: MapIcon },
              { id: "laps", label: "Lap Times", icon: Layers },
              { id: "pedals", label: "Pedal Analysis", icon: Zap },
              { id: "comparison", label: "Comparison", icon: Maximize2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 font-orbitron font-bold text-[10px] tracking-widest uppercase transition-all relative overflow-hidden group",
                  activeTab === tab.id ? "text-white bg-[var(--f1-red)] shadow-[0_0_20px_rgba(255,24,1,0.2)]" : "text-white/40 hover:text-white bg-white/5"
                )}
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
              >
                <tab.icon size={14} className={cn(activeTab === tab.id ? "animate-pulse" : "opacity-40")} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedDriver || "") + (compareDriver || "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "speed" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="Fastest Lap" value={telemetry?.lap_time?.split('0 days ')[1]?.split('.')[0] || "--:--.---"} icon={Clock} color="var(--f1-red)" />
                    <StatBox label="Top Speed" value={telemetry ? `${Math.max(...telemetry.telemetry.speed)} KM/H` : "--- KM/H"} icon={Gauge} color="white" />
                    <StatBox label="Avg RPM" value={telemetry ? Math.floor(telemetry.telemetry.rpm.reduce((a:any, b:any)=>a+b,0)/telemetry.telemetry.rpm.length) : "----"} icon={Activity} color="white" />
                    <StatBox label="Max Gear" value={telemetry ? `G${Math.max(...telemetry.telemetry.gear)}` : "-"} icon={BarChart3} color="white" />
                  </div>

                  <div className="card-base p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-[var(--f1-red)]" />
                        <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Speed_vs_Time_Envelope</h3>
                      </div>
                      <div className="flex gap-4 font-mono text-[9px]">
                        <span className="flex items-center gap-2"><div className="w-2 h-2" style={{ backgroundColor: getDriverColor(selectedDriver || "") }} /> {selectedDriver}</span>
                      </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={getDriverColor(selectedDriver || "")} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={getDriverColor(selectedDriver || "")} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={['auto', 'auto']} stroke="white/40" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'JetBrains Mono'}}
                            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                          />
                          <Area type="monotone" dataKey="speed" stroke={getDriverColor(selectedDriver || "")} fillOpacity={1} fill="url(#colorSpeed)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "track" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card-base p-6">
                    <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase mb-6">Circuit_Topology</h3>
                    <TrackMap 
                      x={trackData?.x || []} 
                      y={trackData?.y || []} 
                      corners={trackData?.corners}
                      loading={loading}
                    />
                  </div>
                  <div className="card-base p-6 flex flex-col">
                    <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase mb-6">Corner_Profile_Index</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {trackData?.corners.map((corner: any) => (
                        <div key={corner.number} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-[var(--f1-red)]/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-orbitron font-black text-xs text-[var(--f1-red)] group-hover:scale-110 transition-transform">
                              {corner.number}
                            </div>
                            <div>
                              <span className="font-mono text-[10px] text-white uppercase block">Turn {corner.number}</span>
                              <span className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">METRIC_COORD: {Math.round(corner.distance)}M</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-[10px] text-white font-bold">{Math.round(corner.angle)}°</div>
                            <div className="font-mono text-[8px] text-[var(--f1-gray-light)] uppercase">ANGLE</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "comparison" && (
                <div className="space-y-6">
                  {!compareDriver ? (
                    <div className="h-[400px] card-base border-dashed border-white/10 flex flex-col items-center justify-center text-center p-20">
                      <div className="w-16 h-16 rounded-full bg-[var(--f1-red)]/10 flex items-center justify-center mb-6">
                        <Maximize2 size={32} className="text-[var(--f1-red)] animate-pulse" />
                      </div>
                      <h3 className="font-orbitron font-bold text-xl text-white mb-2 tracking-widest">Dual_Channel_Comparison</h3>
                      <p className="font-mono text-[10px] text-[var(--f1-gray-light)] max-w-sm uppercase leading-relaxed">
                        Select a secondary driver from the feed to overlay high-frequency speed traces and calculate the live time delta.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="card-base p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <Maximize2 size={16} className="text-[var(--f1-red)]" />
                            <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Differential_Speed_Map</h3>
                          </div>
                          <div className="flex gap-6 font-mono text-[9px]">
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getDriverColor(selectedDriver || "") }} /> {selectedDriver}</span>
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getDriverColor(compareDriver) }} /> {compareDriver}</span>
                          </div>
                        </div>
                        <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={compChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="distance" hide />
                              <YAxis domain={['auto', 'auto']} stroke="white/40" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                              <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'JetBrains Mono'}} />
                              <Line type="monotone" dataKey={selectedDriver || ""} stroke={getDriverColor(selectedDriver || "")} dot={false} strokeWidth={2} />
                              <Line type="monotone" dataKey={compareDriver} stroke={getDriverColor(compareDriver)} dot={false} strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Delta Chart */}
                      <div className="card-base p-8 border-t-2 border-t-[var(--f1-red)]">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-[var(--f1-red)]" />
                            <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">Cumulative_Time_Delta</h3>
                          </div>
                          <div className="font-mono text-[10px] text-white">
                            FINAL GAP: <span className={cn("font-bold", (comparisonData?.delta?.[comparisonData.delta.length - 1] > 0 ? "text-red-500" : "text-green-500"))}>
                              {comparisonData?.delta?.[comparisonData.delta.length - 1]?.toFixed(3)}s
                            </span>
                          </div>
                        </div>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={compChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="distance" stroke="white/20" tick={{fontSize: 9, fontFamily: 'JetBrains Mono'}} label={{ value: 'TRACK DISTANCE (M)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} />
                              <YAxis stroke="white/40" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                              <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'JetBrains Mono'}} />
                              <Area type="stepAfter" dataKey="delta" stroke="#ffffff" fill="rgba(255,255,255,0.05)" strokeWidth={1} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="mt-4 font-mono text-[8px] text-[var(--f1-gray-light)] uppercase tracking-widest text-center italic">
                          * Values above 0 indicate {selectedDriver} is losing time relative to {compareDriver}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "laps" && (
                <div className="card-base p-8">
                  <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase mb-8">Race_Pace_Scatter_Analysis</h3>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="lap_number" name="Lap" stroke="#8E8E93" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                        <YAxis type="number" dataKey="lap_time" name="Time" domain={['auto', 'auto']} reversed stroke="#8E8E93" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                        <ZAxis type="category" dataKey="compound" name="Compound" />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#0a0a0a] border border-white/10 p-3 font-mono text-[10px]">
                                  <div className="text-[var(--f1-red)] mb-1 font-bold">LAP {data.lap_number}</div>
                                  <div className="text-white">TIME: {data.lap_time.toFixed(3)}s</div>
                                  <div className="text-[var(--f1-gray-light)] uppercase">TYRE: {data.compound}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {Array.from(new Set(allLaps.filter(l => l.driver === selectedDriver).map(l => l.compound))).map(compound => (
                          <Scatter 
                            key={compound}
                            name={compound} 
                            data={allLaps.filter(l => l.driver === selectedDriver && l.compound === compound)} 
                            fill={getTireColor(compound)} 
                            shape="circle"
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === "pedals" && (
                <div className="space-y-6">
                  <div className="card-base p-8">
                    <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase mb-8">Telemetry_Pedal_Log</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="white/40" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                          <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'JetBrains Mono'}} />
                          <Area type="monotone" dataKey="throttle" stroke="#22c55e" fill="#22c55e" fillOpacity={0.05} dot={false} strokeWidth={2} />
                          <Area type="monotone" dataKey="brake" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} dot={false} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-base p-8">
                      <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase mb-8">Engine_RPM_Band</h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} stroke="white/40" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} />
                            <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px'}} />
                            <Line type="monotone" dataKey="rpm" stroke="#3b82f6" dot={false} strokeWidth={1} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="card-base p-8">
                      <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase mb-8">Gear_Usage_Telemetry</h3>
                      <div className="h-[200px] w-full flex items-end gap-1">
                        {chartData.filter((_, i) => i % 20 === 0).map((d: any, i: number) => (
                          <div 
                            key={i} 
                            className="flex-1 transition-all hover:scale-110" 
                            style={{ 
                              height: `${(d.gear / 8) * 100}%`, 
                              backgroundColor: gearColorMap(d.gear),
                              opacity: 0.6
                            }} 
                            title={`Gear ${d.gear}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-4">
                         {[1,2,3,4,5,6,7,8].map(g => (
                           <span key={g} className="font-mono text-[8px] text-white/40">G{g}</span>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="p-6 border border-white/10 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group"
      style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
      <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-[var(--f1-red)] transition-colors" />
      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.2em] mb-2 uppercase">{label}</div>
      <div className="flex items-center gap-3">
        <Icon size={16} style={{ color }} className="opacity-50 group-hover:scale-110 transition-transform" />
        <div className="font-orbitron font-black text-lg text-white group-hover:text-[var(--f1-red)] transition-colors tracking-tighter">{value}</div>
      </div>
    </div>
  );
}
