import React from 'react';
import { Card, SectionHeader, Badge } from '../components/ui';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

const corrData = [
  { x: 1, y: 1, val: 0.92, name: 'Grid Pos vs Finish' },
  { x: 2, y: 2, val: 0.85, name: 'Lap Time vs Tire Age' },
  { x: 3, y: 3, val: -0.45, name: 'Weather vs DNF' },
];

export default function StatisticsPanel() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Statistical Analysis Engine" subtitle="Hypothesis Testing & Correlation Matrices" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700 text-white">
          <h3 className="font-bold mb-4 text-emerald-400">Team Performance T-Test</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
              <span className="text-sm text-slate-400">Comparison: Red Bull vs Ferrari</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">SIGNIFICANT</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-3 rounded text-center">
                <div className="text-xs text-slate-500">P-VALUE</div>
                <div className="text-xl font-mono">0.024</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded text-center">
                <div className="text-xs text-slate-500">T-STATISTIC</div>
                <div className="text-xl font-mono">3.41</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700 text-white">
          <h3 className="font-bold mb-4 text-blue-400">Correlation Heatmap</h3>
          <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                 <XAxis type="number" dataKey="x" hide />
                 <YAxis type="number" dataKey="y" hide />
                 <ZAxis type="number" dataKey="val" range={[50, 400]} />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 p-2 rounded border border-slate-700 text-xs">
                          {payload[0].payload.name}: {payload[0].payload.val}
                        </div>
                      );
                    }
                    return null;
                 }} />
                 <Scatter data={corrData}>
                   {corrData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.val > 0 ? '#10b981' : '#ef4444'} />
                   ))}
                 </Scatter>
               </ScatterChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
