"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useFastF1 } from "@/hooks/useFastF1";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  Activity, Zap, Search, ChevronRight, 
  BarChart3, Thermometer, Clock, Gauge 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionResult {
  position: number;
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

interface TelemetryData {
  driver: string;
  lap_number: number;
  lap_time: string;
  telemetry: {
    time: number[];
    speed: number[];
    rpm: number[];
    gear: number[];
    throttle: number[];
    brake: number[];
    drs: number[];
  };
}

interface ComparisonData {
  d1: { name: string; lap_time: string; speed: number[]; distance: number[] };
  d2: { name: string; lap_time: string; speed: number[]; distance: number[] };
}

export default function AnalysisPage() {
  const { getSession, getTelemetry, getComparison, loading, error } = useFastF1();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedEvent, setSelectedEvent] = useState("Bahrain");
  const [selectedSession, setSelectedSession] = useState("R");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareDriver2, setCompareDriver2] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  const handleLoadSession = async () => {
    const data = await getSession(selectedYear, selectedEvent, selectedSession);
    if (data) setSessionData(data);
  };

  const handleLoadTelemetry = async (driver: string) => {
    if (comparisonMode && selectedDriver) {
      setCompareDriver2(driver);
      const data = await getComparison(selectedYear, selectedEvent, selectedSession, selectedDriver, driver);
      if (data) setComparisonData(data);
    } else {
      setSelectedDriver(driver);
      const data = await getTelemetry(selectedYear, selectedEvent, selectedSession, driver);
      if (data) setTelemetryData(data);
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      const data = await getSession(selectedYear, selectedEvent, selectedSession);
      if (isMounted && data) {
        setSessionData(data);
      }
    };

    init();
    
    return () => { isMounted = false; };
  }, [getSession, selectedYear, selectedEvent, selectedSession]);

  const formattedTelemetry = telemetryData?.telemetry ? 
    telemetryData.telemetry.time.map((t: number, i: number) => ({
      time: t.toFixed(2),
      speed: telemetryData.telemetry.speed[i],
      rpm: telemetryData.telemetry.rpm[i],
      throttle: telemetryData.telemetry.throttle[i],
      brake: telemetryData.telemetry.brake[i],
      gear: telemetryData.telemetry.gear[i],
    })) : [];

  const formattedComparison = comparisonData ? 
    comparisonData.d1.distance.map((dist: number, i: number) => ({
      distance: dist.toFixed(0),
      [comparisonData.d1.name]: comparisonData.d1.speed[i],
      [comparisonData.d2.name]: (comparisonData.d2.speed[i] !== undefined) ? comparisonData.d2.speed[i] : 0,
    })) : [];

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-10 pb-32">
      {/* Header HUD */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b border-white/10 pb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.4em] font-bold">DEEP_ANALYSIS_MODE</span>
            <div className="h-[1px] w-8 bg-[var(--f1-red)]/30" />
          </div>
          <h1 className="font-orbitron font-black text-3xl md:text-5xl text-white tracking-widest uppercase">
            TELEMETRY_<span className="text-[var(--f1-red)]">LAB</span>
          </h1>
          <p className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest uppercase mt-2">
            POWERED BY FAST-F1 REALTIME DATA ENGINE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-black border border-white/10 text-white font-mono text-[11px] p-3 outline-none"
          >
            {[2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <input 
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            placeholder="Event (e.g. Bahrain)"
            className="bg-black border border-white/10 text-white font-mono text-[11px] p-3 outline-none min-w-[150px]"
          />
          <select 
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="bg-black border border-white/10 text-white font-mono text-[11px] p-3 outline-none"
          >
            <option value="R">RACE</option>
            <option value="Q">QUALIFYING</option>
            <option value="FP3">FP3</option>
          </select>
          <button 
            onClick={handleLoadSession}
            disabled={loading}
            className="bg-[var(--f1-red)] text-white font-orbitron font-bold text-[10px] px-6 py-3 tracking-widest hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "FETCHING..." : "INITIALIZE_UPLINK"}
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-8 p-4 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-xs">
          ERROR_UPLINK_FAILED: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column - Results / Driver Selection */}
        <div className="xl:col-span-3 space-y-6">
          <div className="card-base" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}>
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <h3 className="font-orbitron font-bold text-[10px] text-white tracking-widest uppercase">SESSION_RESULTS</h3>
              <button 
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  setCompareDriver2(null);
                  setComparisonData(null);
                }}
                className={cn(
                  "font-mono text-[9px] px-2 py-1 border transition-colors",
                  comparisonMode ? "border-[var(--f1-red)] text-[var(--f1-red)] bg-[var(--f1-red)]/10" : "border-white/10 text-white/40"
                )}
              >
                COMPARE
              </button>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {sessionData?.results.map((res: SessionResult) => (
                <button
                  key={res.driver_code}
                  onClick={() => handleLoadTelemetry(res.driver_code)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-all text-left group",
                    selectedDriver === res.driver_code && "bg-[var(--f1-red)]/[0.05] border-l-2 border-l-[var(--f1-red)]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-orbitron font-black text-sm text-[var(--f1-gray-light)] group-hover:text-white transition-colors">
                      {String(res.position).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-orbitron font-bold text-xs text-white uppercase">{res.driver_code}</div>
                      <div className="font-mono text-[9px] text-[var(--f1-gray-light)] uppercase">{res.team}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-[var(--f1-red)] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Deep Telemetry Charts */}
        <div className="xl:col-span-9 space-y-8">
          {comparisonData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="card-base p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">SPEED_COMPARISON_BY_DISTANCE</h3>
                  <div className="flex gap-4 font-mono text-[9px]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2" style={{backgroundColor: 'var(--f1-red)'}} /> {comparisonData.d1.name}</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2" style={{backgroundColor: '#3b82f6'}} /> {comparisonData.d2.name}</span>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="distance" hide />
                      <YAxis stroke="white" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px'}} />
                      <Line type="monotone" dataKey={comparisonData.d1.name} stroke="var(--f1-red)" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey={comparisonData.d2.name} stroke="#3b82f6" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          ) : !telemetryData ? (
            <div className="h-[600px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-20">
              <Activity size={48} className="text-white/10 mb-6" />
              <h3 className="font-orbitron font-bold text-xl text-white mb-2">NO_DRIVER_SELECTED</h3>
              <p className="font-mono text-xs text-[var(--f1-gray-light)] max-w-sm">
                SELECT A DRIVER FROM THE LIST TO DECODE HIGH-FREQUENCY TELEMETRY DATA FROM THE FAST-F1 ENGINE.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Telemetry HUD Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <AnalysisStat label="LAP_TIME" value={telemetryData.lap_time} icon={Clock} color="var(--f1-red)" />
                <AnalysisStat label="MAX_SPEED" value={`${Math.max(...telemetryData.telemetry.speed)} KM/H`} icon={Gauge} color="white" />
                <AnalysisStat label="AVG_RPM" value={`${Math.floor(telemetryData.telemetry.rpm.reduce((a: number, b: number) => a + b, 0) / telemetryData.telemetry.rpm.length)}`} icon={Activity} color="white" />
                <AnalysisStat label="GEARS_USED" value={`${Math.max(...telemetryData.telemetry.gear)} SPD`} icon={BarChart3} color="white" />
              </div>

              {/* Speed / RPM Chart */}
              <div className="card-base p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">SPEED_AND_RPM_ENVELOPE</h3>
                  <div className="flex gap-4 font-mono text-[9px]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[var(--f1-red)]" /> SPEED</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500" /> RPM</span>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedTelemetry}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis yAxisId="left" stroke="var(--f1-red)" tick={{fontSize: 10}} />
                      <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px'}}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="speed" stroke="var(--f1-red)" dot={false} strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="rpm" stroke="#3b82f6" dot={false} strokeWidth={1} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pedals Analysis Chart */}
              <div className="card-base p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-orbitron font-bold text-[11px] text-white tracking-[0.4em] uppercase">THROTTLE_BRAKE_INPUT_LOG</h3>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedTelemetry}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis tick={{fontSize: 10}} />
                      <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px'}} />
                      <Area type="monotone" dataKey="throttle" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} dot={false} />
                      <Area type="monotone" dataKey="brake" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnalysisStatProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

function AnalysisStat({ label, value, icon: Icon, color }: AnalysisStatProps) {
  return (
    <div className="p-6 border border-white/10 bg-white/[0.02] backdrop-blur-md"
      style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
      <div className="font-mono text-[8px] text-[var(--f1-gray-light)] tracking-[0.2em] mb-2 uppercase">{label}</div>
      <div className="flex items-center gap-3">
        <Icon size={16} style={{ color }} />
        <div className="font-orbitron font-black text-lg text-white">{value}</div>
      </div>
    </div>
  );
}
