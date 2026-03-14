import React from 'react';
import { Card, SectionHeader } from '../components/ui';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

const telemetryData = Array.from({ length: 20 }, (_, i) => ({
  lap: i + 1,
  pace: 90 + Math.random() * 5,
  tireWear: i * 5,
  limit: 100
}));

export default function TelemetryDashboard() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Real-Time Telemetry & Simulation" subtitle="Digital Twin Lap Analysis" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-f1-red"></span>
            Lap Pace Comparison (Live)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="lap" stroke="#94a3b8" />
                <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="pace" stroke="#ef4444" strokeWidth={2} dot={false} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-yellow-500"></span>
            Tire Degradation Model
          </h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={telemetryData}>
                 <defs>
                   <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="lap" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                 <Area type="monotone" dataKey="tireWear" stroke="#eab308" fillOpacity={1} fill="url(#colorWear)" />
                 <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
