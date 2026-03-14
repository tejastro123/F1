import React from 'react';
import { Card } from '../components/ui';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

const dummyShap = [
  { name: 'Grid Position', value: 4.5, impact: 'positive' },
  { name: 'Recent Form', value: 2.1, impact: 'positive' },
  { name: 'Circuit Familiarity', value: 1.5, impact: 'positive' },
  { name: 'Constructor Reliability', value: -1.2, impact: 'negative' },
  { name: 'Weather Conditions', value: -0.8, impact: 'negative' },
];

export default function ShapExplainer({ driver_id }) {
  return (
    <Card className="p-6 bg-slate-800 border-slate-700 text-white">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-500 rounded"></span>
        Prediction Explainability (SHAP)
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Impact of features on the prediction for <span className="text-white font-bold uppercase">{driver_id || 'Selected Driver'}</span>
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dummyShap} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
            />
            <ReferenceLine x={0} stroke="#475569" />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {dummyShap.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.impact === 'positive' ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 text-sm italic text-slate-300">
        "The model is primarily confident due to a strong qualifying performance (P1) and a high rolling form index over the last 5 races."
      </div>
    </Card>
  );
}
