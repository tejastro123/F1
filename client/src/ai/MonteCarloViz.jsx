import React, { useMemo } from 'react';
import { Card } from '../components/ui';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend } from 'recharts';

// Dummy data for Monte Carlo Simulation (10,000 runs aggregated)
const simData = [
  { driver: 'Verstappen', pos: 1, count: 4500 },
  { driver: 'Hamilton', pos: 1, count: 1200 },
  { driver: 'Leclerc', pos: 1, count: 800 },
  { driver: 'Norris', pos: 2, count: 3000 },
  { driver: 'Sainz', pos: 2, count: 1500 },
];

export default function MonteCarloViz() {
  const chartData = useMemo(() => {
    return simData.map(d => ({
      ...d,
      x: d.pos,
      y: d.count,
      z: d.count / 100 // Size of bubble
    }));
  }, []);

  return (
    <Card className="p-6 bg-slate-800 border-slate-700 text-white">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-purple-500 rounded"></span>
        Monte Carlo Championship Simulation (N=10,000)
      </h3>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="x" name="Final Position" unit="" domain={[1, 5]} tickCount={5} />
            <YAxis type="number" dataKey="y" name="Frequency" />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
            <Legend />
            <Scatter name="Championship Outcomes" data={chartData} fill="#a855f7" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-slate-400 text-center">
        *Position 1 represents the probability of becoming the 2026 World Champion.
      </div>
    </Card>
  );
}
