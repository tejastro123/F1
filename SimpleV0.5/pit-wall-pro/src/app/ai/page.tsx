"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Cpu, RefreshCw } from "lucide-react";
import { useF1Store, useLiveRaceStore } from "@/store/f1Store";

interface AIInsight {
  type: "prediction" | "analysis" | "comparison" | "strategy";
  title: string;
  content: string;
  confidence: number;
}

const TYPE_COLORS = {
  prediction: "#A855F7",
  analysis: "#27F4D2",
  comparison: "#FF8700",
  strategy: "#E10600",
};

const TYPE_ICONS = {
  prediction: TrendingUp,
  analysis: Cpu,
  comparison: Brain,
  strategy: Sparkles,
};

export default function AIInsightsPage() {
  const { driverStandings, constructorStandings } = useF1Store();
  const { isConnected } = useLiveRaceStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Prepare context from real live API data to inject into LLM
      const f1Context = {
        topDrivers: driverStandings.slice(0, 5).map(d => ({
          name: `${d.Driver.givenName} ${d.Driver.familyName}`,
          points: d.points,
          team: d.Constructors[0]?.name
        })),
        topTeams: constructorStandings.slice(0, 3).map(c => ({
          name: c.Constructor.name,
          points: c.points
        }))
      };

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ f1Context })
      });

      if (!res.ok) throw new Error("Failed to generate AI insights");

      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [driverStandings, constructorStandings]);

  // Initial fetch
  useEffect(() => {
    if (driverStandings.length > 0) {
      const timer = setTimeout(() => {
        fetchInsights();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [driverStandings.length, fetchInsights]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Brain size={24} className="text-[#A855F7]" />
        <h1 className="font-orbitron font-black text-3xl tracking-widest uppercase"
          style={{ background: "linear-gradient(135deg,#fff 0%,#A855F7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          AI RACE INSIGHTS
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500 to-transparent" />
        <button onClick={fetchInsights} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 border border-purple-500/40 bg-purple-500/10 text-purple-400 font-mono text-[11px] tracking-widest hover:bg-purple-500/20 transition-all ${loading ? "opacity-50 pointer-events-none" : ""}`}
          style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "GENERATING..." : "REGENERATE"}
        </button>
      </div>

      {/* Hero AI card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 md:p-8 border-2 border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-[var(--f1-dark)] relative overflow-hidden"
        style={{ clipPath: "polygon(0 0,calc(100% - 30px) 0,100% 30px,100% 100%,0 100%)" }}>
        {loading && (
          <div className="absolute inset-0 bg-purple-500/10 animate-pulse pointer-events-none" />
        )}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-2 bg-purple-500/20 rounded-full"><Sparkles size={20} className="text-purple-400" /></div>
          <div>
            <div className="font-orbitron font-black text-xl text-white tracking-widest">PIT WALL GEMINI ENGINE</div>
            <div className="font-mono text-[10px] text-purple-400 tracking-widest flex items-center gap-2">
              Powered by Google Gemini Flash <span className={`live-dot w-1.5 h-1.5 inline-block ${isConnected ? "" : "opacity-30 grayscale"}`} /> 
              {isConnected ? "LIVE RAG" : "SYNCING DATA..."}
            </div>
          </div>
        </div>
        <p className="font-rajdhani text-base text-[var(--f1-gray-light)] leading-relaxed relative z-10">
          Our AI analyzes live telemetry, championship patterns, and circuit characteristics to generate real-time race insights, driver comparisons, and championship predictions. Insights below are dynamically generated using Retrieval-Augmented Generation (RAG) based on current live Ergast standings.
        </p>
      </motion.div>

      {error && (
        <div className="mb-8 p-4 border border-[var(--f1-red)] bg-[var(--f1-red)]/10 text-[var(--f1-red)] font-mono text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading && insights.length === 0 ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Brain size={48} className="text-purple-500/50" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {insights.map((insight, i) => {
            const color = TYPE_COLORS[insight.type] || TYPE_COLORS.analysis;
            const Icon = TYPE_ICONS[insight.type] || TYPE_ICONS.analysis;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-base overflow-hidden"
                style={{ clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)", borderColor: `${color}40` }}>
                <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color }} />
                      <span className="font-orbitron font-bold text-sm text-white tracking-wider">{insight.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-widest" style={{ color }}>
                        {insight.confidence}% CONFIDENCE
                      </span>
                      <div className="w-16 h-1.5 bg-[var(--f1-gray)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${insight.confidence}%`, background: color }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-rajdhani text-base text-[var(--f1-gray-light)] leading-relaxed">
                    {insight.content}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] tracking-widest px-2 py-1"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                    {insight.type.toUpperCase()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
