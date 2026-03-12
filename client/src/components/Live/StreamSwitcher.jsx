import { motion } from 'framer-motion';

export default function StreamSwitcher({ tracks, activeTrackId, onSelect, isTheaterMode }) {
  if (tracks.length <= 1) return null;

  return (
    <div className={`flex gap-3 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl ${isTheaterMode ? 'absolute top-6 left-1/2 -translate-x-1/2 z-50' : ''}`}>
      {tracks.map((track, idx) => {
        const isActive = track.publication.trackSid === activeTrackId;
        const label = track.publication.trackName || `Feed ${idx + 1}`;

        return (
          <button
            key={track.publication.trackSid}
            onClick={() => onSelect(track.publication.trackSid)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden flex items-center gap-2 ${
              isActive 
                ? 'bg-f1-red text-white shadow-lg' 
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            {isActive && (
              <motion.span 
                layoutId="active-bg"
                className="absolute inset-0 bg-f1-red -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
