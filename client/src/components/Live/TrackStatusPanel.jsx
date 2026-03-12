import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext.jsx';
import { Card } from '../ui.jsx';

export default function TrackStatusPanel() {
  const { socket } = useSocket();
  const [conditions, setConditions] = useState({
    airTemp: 24,
    trackTemp: 38,
    humidity: 45,
    rainProb: 10,
    status: 'DRY'
  });

  useEffect(() => {
    if (!socket) return;
    
    socket.on('track-update', (data) => {
      setConditions((prev) => ({ ...prev, ...data }));
    });

    return () => socket.off('track-update');
  }, [socket]);

  const stats = [
    { label: 'Air', value: `${conditions.airTemp}°C`, icon: '🌡️' },
    { label: 'Track', value: `${conditions.trackTemp}°C`, icon: '🏎️' },
    { label: 'Humidity', value: `${conditions.humidity}%`, icon: '💧' },
    { label: 'Rain Prob', value: `${conditions.rainProb}%`, icon: '☁️' },
  ];

  return (
    <Card className="relative overflow-hidden group border-white/5 bg-white/5">
      <div className="absolute -top-3 left-6 px-2 py-0.5 bg-gray-500 text-[8px] font-black italic tracking-widest text-white uppercase rounded">
        Track Conditions
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 min-w-[100px] p-3 rounded-2xl bg-f1-panel border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{s.icon}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.label}</span>
            </div>
            <div className="text-lg font-black text-white">{s.value}</div>
          </div>
        ))}
        
        <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 border transition-colors ${
          conditions.status === 'WET' ? 'bg-f1-primary/20 border-f1-primary text-f1-primary animate-pulse' : 'bg-white/5 border-white/10 text-white'
        }`}>
          <div className={`w-3 h-3 rounded-full ${conditions.status === 'WET' ? 'bg-f1-primary' : 'bg-green-500'}`} />
          <span className="font-black text-sm tracking-tighter">{conditions.status}</span>
        </div>
      </div>
    </Card>
  );
}
