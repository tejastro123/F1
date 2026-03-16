import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useOracle } from '../hooks/useData.jsx';
import { SectionHeader, Card, StatPill, SkeletonCard, Button } from '../components/ui.jsx';
import { getTeamColor } from '../utils/teamColors.js';
import TrackMap3D from '../components/TrackMap3D.jsx';

export default function StrategicOracle() {
  const { report, loading, error } = useOracle();
  // Defensive fallback for report shape
  const safeReport = report && typeof report === 'object' ? report : {};
  const safeRace = safeReport.race && typeof safeReport.race === 'object' ? safeReport.race : {};
  const safePredictions = Array.isArray(safeReport.predictions) ? safeReport.predictions : [];
  const safeRationale = Array.isArray(safeReport.rationale) ? safeReport.rationale : [];

  if (error) return (
    <div className="pt-32 min-h-screen text-center">
      <h2 className="text-f1-red font-black uppercase tracking-widest">Protocol Failure</h2>
      <p className="text-gray-500 mt-4 uppercase text-xs font-bold tracking-widest">Unable to verify connection to the prediction cluster.</p>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen bg-f1-dark text-white overflow-hidden">
      <Helmet>
        <title>Strategic Oracle | F1 2026</title>
      </Helmet>

      {/* Futuristic Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(225,6,0,0.1),transparent_50%)]" />
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <SectionHeader 
            title="Strategic Oracle" 
            subtitle="Weighted probability analysis for upcoming competitive operations" 
            className="!mb-0"
          />
          
          <div className="flex items-center gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-4 backdrop-blur-xl">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">System Confidence</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black italic text-f1-gold tabular-nums">{loading ? '--' : (typeof safeReport.oracleConfidence === 'number' ? safeReport.oracleConfidence : '--')}%</span>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: loading ? '0%' : `${typeof safeReport.oracleConfidence === 'number' ? safeReport.oracleConfidence : 0}%` }}
                    className="h-full bg-f1-gold shadow-[0_0_10px_#FFD700]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      {loading ? (
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <SkeletonCard className="h-96 rounded-3xl" />
          </div>
          <div className="lg:col-span-4 gap-6 flex flex-col">
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-40" />
          </div>
        </div>
      ) : !report ? (
        <div className="py-20 text-center">
          <h2 className="text-f1-red font-black uppercase tracking-widest text-2xl mb-4 italic">Neural Link Offline</h2>
          <p className="text-gray-500 uppercase text-xs font-bold tracking-[0.2em]">Prediction matrix unavailable - retrying synchronization...</p>
        </div>
      ) : report && report.error ? (
        <div className="py-20 text-center">
          <h2 className="text-f1-red font-black uppercase tracking-widest text-2xl mb-4 italic">Analysis Interrupted</h2>
          <p className="text-gray-500 uppercase text-xs font-bold tracking-[0.2em]">{report.error}</p>
        </div>
      ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Mission Target Section */}
            <div className="lg:col-span-8 space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="absolute -top-12 -left-12 text-[15rem] font-black text-white/[0.02] italic pointer-events-none select-none uppercase tracking-tighter">TARGET</div>
                <div className="grid md:grid-cols-12 gap-6 relative">
                  <div className="md:col-span-12 lg:col-span-7 h-[450px]">
                    <TrackMap3D predictions={safePredictions} />
                  </div>
                  <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
                    <Card className="flex-1 border-f1-red/20 shadow-[0_0_50px_rgba(2225,6,0,0.05)] bg-white/[0.02] overflow-hidden group p-8">
                      <div className="h-full flex flex-col justify-center">
                        <span className="text-6xl mb-6 group-hover:scale-110 transition-transform block w-fit">{safeRace.flag || '🏁'}</span>
                        <h2 className="text-4xl font-bold italic tracking-tighter uppercase leading-[0.9] mb-4">{safeRace.name || 'Circuit Unavailable'}</h2>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8">
                          <span className="w-2 h-2 bg-f1-red rounded-full animate-pulse" />
                          Round {safeRace.round || '--'} · {safeRace.venue || 'Unknown Location'}
                        </div>
                          
                        <div className="space-y-4">
                          <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Network Status</span>
                            <span className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                              Telemetry Sync Active
                            </span>
                          </div>
                          <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Processing Load</span>
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Distributed Neural Array</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>

              {/* Neural Rationales */}
              <div className="space-y-6">
                 <h3 className="text-[10px] font-black text-f1-red uppercase tracking-[0.5em] italic">Strategic Rationale</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    {safeRationale.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors"
                      >
                         <div className="absolute top-0 left-0 w-1 h-full bg-f1-red/30" />
                         <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Core Analysis {i + 1}</span>
                         <p className="text-sm font-medium text-gray-300 leading-relaxed italic uppercase">"{r}"</p>
                      </motion.div>
                    ))}
                    {safeRationale.length === 0 && (
                      <div className="md:col-span-2 p-8 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Rationale Available</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Probability Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <h3 className="text-[10px] font-black text-f1-red uppercase tracking-[0.5em] italic">Probability Matrix</h3>
               <div className="space-y-4">
                  {safePredictions.map((p, i) => (
                    <motion.div
                      key={p && p._id ? p._id : i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                    >
                      <Card className="relative overflow-hidden group hover:translate-x-1 transition-transform border-white/5 bg-white/[0.02]">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] italic font-black text-7xl pointer-events-none uppercase">P{i+1}</div>
                        <div className="flex items-center gap-6">
                           <div className="relative">
                              {p && p.photoUrl ? (
                                <img src={p.photoUrl} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">👤</div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-f1-red flex items-center justify-center text-[10px] font-black border-2 border-f1-dark italic shadow-lg">
                                P{i+1}
                              </div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-black italic uppercase tracking-tighter truncate group-hover:text-f1-red transition-colors">{p && p.fullName ? p.fullName : 'Incomplete Profile'}</h4>
                              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: getTeamColor(p && p.team ? p.team : '') }}>{p && p.team ? p.team : 'Unassigned'}</span>
                              
                              <div className="mt-4 flex items-center gap-4">
                                 <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${p && typeof p.probability === 'number' ? p.probability : 0}%` }}
                                      className="h-full bg-current"
                                      style={{ color: getTeamColor(p && p.team ? p.team : '') }}
                                    />
                                 </div>
                                 <span className="text-xs font-black tabular-nums">{p && typeof p.probability === 'number' ? p.probability : 0}%</span>
                              </div>
                           </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  {safePredictions.length === 0 && (
                    <div className="p-8 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Predictions Generated</p>
                    </div>
                  )}
               </div>

               {/* Machine Legend */}
               <Card glass className="mt-12 opacity-50 border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-4 border-b border-white/5 pb-2">Technical Telemetry</span>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-gray-600">Computation Mode</span>
                        <span className="text-white">Neural Net v4.2</span>
                     </div>
                     <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-gray-600">Model Variance</span>
                        <span className="text-blue-500">&plusmn; 4.1%</span>
                     </div>
                     <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-gray-600">Entropy Score</span>
                        <span className="text-f1-red">Critically Low</span>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        )}

        <div className="mt-20 pt-12 border-t border-white/5 text-center">
            <p className="max-w-xl mx-auto text-[10px] font-medium text-gray-600 uppercase tracking-widest leading-loose">
              Predictions are generated via a weighted neural coefficient analyzing seasonal momentum and technical telemetry. No financial or betting decisions should be made based on machine intelligence outputs.
            </p>
        </div>
      </div>
    </div>
  );
}
