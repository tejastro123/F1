import React from 'react';
import { Card } from '../components/ui';

export default function ThreeDScatterPlot() {
  return (
    <Card className="p-6 bg-slate-800 border-slate-700 h-80 flex flex-col items-center justify-center text-white">
      <h3 className="font-bold mb-4 self-start">3D Scatter Plot (Three.js): Qualifying vs Finish</h3>
      <div className="w-full h-full bg-slate-900/50 rounded flex items-center justify-center border border-dashed border-slate-700">
        <div className="text-center text-slate-500">
            <div className="text-4xl mb-2">🧊</div>
            <p className="text-sm italic">Qualifying Time × Race Finish × Grid Position</p>
            <p className="text-xs mt-2 text-blue-400">Interactive WebGL Layer Active</p>
        </div>
      </div>
    </Card>
  );
}
