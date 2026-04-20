"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, User, Palette, Bell, Shield, Save, CheckCircle2, 
  Download, Cpu, Activity, Volume2, Database, Terminal
} from "lucide-react";
import { useUserStore } from "@/store/f1Store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, setFavoriteDriver, setFavoriteTeam, logout } = useUserStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Advanced Feature States (Simulated local state for UI demonstration)
  const [hwAcceleration, setHwAcceleration] = useState(true);
  const [telemetryRate, setTelemetryRate] = useState("100");
  const [devMode, setDevMode] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.jolpi.ca/ergast/f1");
  const [audioVolume, setAudioVolume] = useState(70);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [theme, setTheme] = useState("dark");

  const drivers = [
    { id: "verstappen", name: "Max Verstappen" },
    { id: "hamilton", name: "Lewis Hamilton" },
    { id: "norris", name: "Lando Norris" },
    { id: "leclerc", name: "Charles Leclerc" },
    { id: "russell", name: "George Russell" },
    { id: "piastri", name: "Oscar Piastri" },
  ];

  const teams = [
    { id: "red_bull", name: "Red Bull Racing" },
    { id: "mercedes", name: "Mercedes-AMG" },
    { id: "mclaren", name: "McLaren" },
    { id: "ferrari", name: "Ferrari" },
    { id: "aston_martin", name: "Aston Martin" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const sections = [
    { id: "profile", icon: User, label: "PROFILE" },
    { id: "appearance", icon: Palette, label: "APPEARANCE" },
    { id: "notifications", icon: Bell, label: "NOTIFICATIONS" },
    { id: "advanced", icon: Cpu, label: "ADVANCED CONFIG" },
    { id: "security", icon: Shield, label: "SECURITY & DATA" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-orbitron font-bold text-3xl text-white tracking-widest flex items-center gap-3 drop-shadow-md">
            <div className="p-2 bg-[var(--f1-red)]/20 rounded-lg">
              <Settings className="text-[var(--f1-red)]" />
            </div>
            SYSTEM SETTINGS
          </h1>
          <p className="font-mono text-[11px] text-[var(--f1-gray-light)] tracking-widest mt-2 ml-14">
            PROFILE CONFIGURATION & ADVANCED TELEMETRY
          </p>
        </div>
        
        <div className="flex justify-end relative h-10">
          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-44 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-400 font-mono text-[10px] tracking-widest whitespace-nowrap"
              >
                <CheckCircle2 size={14} /> SYSTEM UPDATED
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-0 h-10 bg-[var(--f1-red)] text-white font-orbitron font-bold text-xs tracking-widest hover:bg-[#c10500] transition-all disabled:opacity-50 overflow-hidden relative group"
            style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Settings size={14} />
              </motion.div>
            ) : (
              <Save size={14} className="relative z-10" />
            )}
            <span className="relative z-10">{isSaving ? "SYNCING..." : "APPLY CHANGES"}</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 font-mono text-[11px] tracking-widest border transition-all relative overflow-hidden group",
                activeSection === item.id 
                  ? "bg-[rgba(225,6,0,0.1)] text-white border-[var(--f1-red)]" 
                  : "text-[var(--f1-gray-light)] border-[var(--f1-gray)] hover:border-white/50 hover:bg-white/5 hover:text-white"
              )}
              style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
            >
              {activeSection === item.id && (
                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--f1-red)]" />
              )}
              <item.icon size={16} className={cn("transition-colors", activeSection === item.id ? "text-[var(--f1-red)]" : "text-inherit")} />
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 border border-[var(--f1-gray)] bg-[rgba(10,10,15,0.8)] backdrop-blur-md shadow-2xl relative overflow-hidden h-full"
              style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--f1-red)] opacity-[0.02] blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              
              <h3 className="font-orbitron font-bold text-lg text-white tracking-widest mb-8 pb-4 border-b border-[var(--f1-gray)]/50 flex items-center gap-3">
                {sections.find(s => s.id === activeSection)?.label}
              </h3>

              {/* 1. PROFILE SECTION */}
              {activeSection === "profile" && (
                <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase flex items-center gap-2">
                        <User size={12} /> Call Sign / Username
                      </label>
                      <input
                        type="text"
                        defaultValue={profile.username}
                        className="w-full bg-[var(--f1-gray)]/20 border border-[var(--f1-gray)] px-5 py-4 font-mono text-sm text-white focus:outline-none focus:border-[var(--f1-red)] focus:bg-[var(--f1-gray)]/40 transition-all hover:border-[var(--f1-gray-light)]"
                        style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
                      />
                    </div>
                    <div className="group">
                      <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase flex items-center gap-2">
                        <Shield size={12} /> Access Level
                      </label>
                      <div className="w-full bg-[rgba(225,6,0,0.05)] border border-[var(--f1-red)]/30 px-5 py-4 font-mono text-sm text-[var(--f1-red)] flex items-center justify-between"
                        style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}>
                        <span>PRO TIER</span>
                        <CheckCircle2 size={16} className="text-[var(--f1-red)]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase">
                        Favorite Driver
                      </label>
                      <div className="relative">
                        <select
                          value={profile.favoriteDriver}
                          onChange={(e) => setFavoriteDriver(e.target.value)}
                          className="w-full bg-[var(--f1-gray)]/20 border border-[var(--f1-gray)] px-5 py-4 font-mono text-sm text-white focus:outline-none focus:border-[var(--f1-red)] focus:bg-[var(--f1-gray)]/40 transition-all appearance-none cursor-pointer hover:border-[var(--f1-gray-light)]"
                          style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
                        >
                          {drivers.map(d => (
                            <option key={d.id} value={d.id} className="bg-[#111] text-white">{d.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--f1-gray-light)]">▼</div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase">
                        Favorite Constructor
                      </label>
                      <div className="relative">
                        <select
                          value={profile.favoriteTeam}
                          onChange={(e) => setFavoriteTeam(e.target.value)}
                          className="w-full bg-[var(--f1-gray)]/20 border border-[var(--f1-gray)] px-5 py-4 font-mono text-sm text-white focus:outline-none focus:border-[var(--f1-red)] focus:bg-[var(--f1-gray)]/40 transition-all appearance-none cursor-pointer hover:border-[var(--f1-gray-light)]"
                          style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
                        >
                          {teams.map(t => (
                            <option key={t.id} value={t.id} className="bg-[#111] text-white">{t.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--f1-gray-light)]">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. APPEARANCE SECTION */}
              {activeSection === "appearance" && (
                <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase">
                        Interface Theme
                      </label>
                      <div className="flex gap-4">
                        {["dark", "light", "system"].map(t => (
                          <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                              "flex-1 py-3 font-mono text-[10px] tracking-widest uppercase border transition-all",
                              theme === t ? "bg-[var(--f1-red)] text-white border-[var(--f1-red)]" : "bg-[var(--f1-gray)]/20 text-[var(--f1-gray-light)] border-[var(--f1-gray)] hover:border-white/50"
                            )}
                            style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ADV FEATURE 1: UI Hardware Acceleration */}
                    <div>
                      <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase flex items-center gap-2">
                        <Cpu size={12} /> Hardware Acceleration
                      </label>
                      <div className="flex items-center justify-between p-4 border border-[var(--f1-gray)] bg-[var(--f1-gray)]/10" style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}>
                        <div>
                          <div className="font-mono text-[11px] text-white">GPU UI RENDERING</div>
                          <div className="font-mono text-[9px] text-[var(--f1-gray-light)]">Improves dashboard fps during live telemetry</div>
                        </div>
                        <button 
                          onClick={() => setHwAcceleration(!hwAcceleration)}
                          className={cn("w-10 h-5 rounded-full relative p-1 transition-colors", hwAcceleration ? "bg-[var(--f1-red)]" : "bg-gray-700")}
                        >
                          <motion.div animate={{ x: hwAcceleration ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full shadow-md" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ADV FEATURE 2: Audio Overlay Mixer */}
                  <div>
                    <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase flex items-center gap-2">
                      <Volume2 size={12} /> Team Radio / Live Feed Volume
                    </label>
                    <div className="flex items-center gap-6 p-6 border border-[var(--f1-gray)] bg-[var(--f1-gray)]/10" style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
                      <Volume2 size={20} className={audioVolume > 0 ? "text-[var(--f1-red)]" : "text-[var(--f1-gray-light)]"} />
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={audioVolume} 
                        onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                        className="w-full accent-[var(--f1-red)] h-1 bg-[var(--f1-gray)] rounded-full appearance-none outline-none"
                      />
                      <span className="font-mono text-[12px] text-white min-w-[3ch]">{audioVolume}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. NOTIFICATIONS SECTION */}
              {activeSection === "notifications" && (
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-5 border border-[var(--f1-gray)] bg-[var(--f1-gray)]/10 group hover:border-white/30 transition-colors" style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}>
                    <div>
                      <div className="font-mono text-[12px] text-white tracking-wider flex items-center gap-2">
                        <Bell size={14} className="text-blue-400" /> PUSH NOTIFICATIONS
                      </div>
                      <div className="font-mono text-[10px] text-[var(--f1-gray-light)] mt-1">Real-time alerts for race starts and red flags</div>
                    </div>
                    <button onClick={() => setPushEnabled(!pushEnabled)} className={cn("w-10 h-5 rounded-full relative p-1 transition-colors", pushEnabled ? "bg-[var(--f1-red)]" : "bg-gray-700")}>
                      <motion.div animate={{ x: pushEnabled ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full shadow-md" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-5 border border-[var(--f1-gray)] bg-[var(--f1-gray)]/10 group hover:border-white/30 transition-colors" style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}>
                    <div>
                      <div className="font-mono text-[12px] text-white tracking-wider flex items-center gap-2">
                        <Bell size={14} className="text-yellow-400" /> EMAIL SUMMARIES
                      </div>
                      <div className="font-mono text-[10px] text-[var(--f1-gray-light)] mt-1">Post-race analytics and fantasy league results</div>
                    </div>
                    <button onClick={() => setEmailEnabled(!emailEnabled)} className={cn("w-10 h-5 rounded-full relative p-1 transition-colors", emailEnabled ? "bg-[var(--f1-red)]" : "bg-gray-700")}>
                      <motion.div animate={{ x: emailEnabled ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full shadow-md" />
                    </button>
                  </div>
                </div>
              )}

              {/* 4. ADVANCED SECTION */}
              {activeSection === "advanced" && (
                <div className="space-y-8 relative z-10">
                  {/* ADV FEATURE 3: Advanced Telemetry Sync */}
                  <div>
                    <label className="block font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-3 uppercase flex items-center gap-2">
                      <Activity size={12} /> Telemetry Sync Rate (ms)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { val: "50", label: "ULTRA (50ms)", desc: "High Network Usage" },
                        { val: "100", label: "FAST (100ms)", desc: "Balanced" },
                        { val: "500", label: "SLOW (500ms)", desc: "Data Saver" }
                      ].map(r => (
                        <button 
                          key={r.val}
                          onClick={() => setTelemetryRate(r.val)}
                          className={cn(
                            "p-4 border transition-all text-left",
                            telemetryRate === r.val ? "bg-[rgba(225,6,0,0.1)] border-[var(--f1-red)] text-white" : "bg-[var(--f1-gray)]/10 border-[var(--f1-gray)] text-[var(--f1-gray-light)] hover:border-white/30"
                          )}
                          style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
                        >
                          <div className="font-orbitron font-bold text-[11px] tracking-widest mb-1">{r.label}</div>
                          <div className="font-mono text-[9px]">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ADV FEATURE 4: Developer Mode / API override */}
                  <div className="p-6 border border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden" style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
                    <div className="absolute top-0 right-0 p-2 bg-yellow-500 text-black font-orbitron font-bold text-[8px] tracking-widest">DEV ONLY</div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-yellow-400 font-mono text-[12px] tracking-widest">
                        <Terminal size={14} /> DEVELOPER OVERRIDES
                      </div>
                      <button onClick={() => setDevMode(!devMode)} className={cn("w-10 h-5 rounded-full relative p-1 transition-colors", devMode ? "bg-yellow-500" : "bg-gray-700")}>
                        <motion.div animate={{ x: devMode ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {devMode && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <label className="block font-mono text-[9px] text-[var(--f1-gray-light)] tracking-widest mb-2 uppercase mt-4">
                            Custom F1 Data API Endpoint
                          </label>
                          <input
                            type="text"
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                            className="w-full bg-[#000] border border-yellow-500/50 px-4 py-3 font-mono text-xs text-yellow-500 focus:outline-none transition-all"
                            style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* 5. SECURITY & DATA SECTION */}
              {activeSection === "security" && (
                <div className="space-y-6 relative z-10">
                  {/* ADV FEATURE 5: Data Export */}
                  <div className="p-6 border border-[var(--f1-gray)] bg-[var(--f1-gray)]/10" style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
                    <h4 className="font-orbitron font-bold text-[12px] text-white tracking-widest mb-2 flex items-center gap-2">
                      <Database size={14} className="text-blue-400" /> TELEMETRY DATA EXPORT
                    </h4>
                    <p className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-4 leading-relaxed">
                      Download your historical session data, saved strategies, and profile configuration in JSON format.
                    </p>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(255,255,255,0.05)] border border-white/20 text-white font-mono text-[10px] tracking-widest hover:bg-white hover:text-black transition-all group" style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}>
                      <Download size={12} className="group-hover:-translate-y-0.5 transition-transform" /> EXPORT SYSTEM DATA
                    </button>
                  </div>

                  <div className="p-6 border border-[var(--f1-red)]/30 bg-[rgba(225,6,0,0.05)]" style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}>
                    <h4 className="font-orbitron font-bold text-[12px] text-[var(--f1-red)] tracking-widest mb-2 flex items-center gap-2">
                      <Shield size={14} /> ACCOUNT ACTIONS
                    </h4>
                    <p className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest mb-4">
                      Terminate current session or permanently delete telemetry profile.
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={logout}
                        className="px-5 py-2.5 bg-[var(--f1-gray)]/30 text-white font-mono text-[10px] tracking-widest hover:bg-[var(--f1-gray)] transition-all" style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}>
                        LOGOUT SESSION
                      </button>
                      <button className="px-5 py-2.5 bg-[var(--f1-red)]/20 text-[var(--f1-red)] font-mono text-[10px] tracking-widest hover:bg-[var(--f1-red)] hover:text-white transition-all border border-[var(--f1-red)]/50" style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}>
                        PURGE PROFILE
                      </button>
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
