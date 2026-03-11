import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { getTeamColor } from '../utils/teamColors.js';

export function ShareCard({ driver, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="w-[400px] h-[220px] rounded-xl overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, #0F0F13 0%, ${getTeamColor(driver.team)}33 100%)`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Top stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: getTeamColor(driver.team) }} />

      {/* Content */}
      <div className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">
            F1 2026 · CHAMPIONSHIP STANDINGS
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-black"
              style={{ color: driver.rank === 1 ? '#F5C518' : '#FFFFFF' }}
            >
              P{driver.rank}
            </span>
            <div>
              <div className="text-white text-xl font-bold">{driver.fullName}</div>
              <div className="text-sm" style={{ color: getTeamColor(driver.team) }}>
                {driver.team}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {[
            { label: 'POINTS', value: driver.points },
            { label: 'WINS', value: driver.wins },
            { label: 'PODIUMS', value: driver.podiums },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-white text-lg font-bold">{s.value}</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/30 flex items-center px-5">
          <span className="text-[10px] text-gray-500">f1tracker2026.com</span>
          <span className="ml-auto text-[10px] text-gray-500">{driver.nationality}</span>
        </div>
      </div>
    </div>
  );
}

export function RaceShareCard({ race, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="w-[400px] h-[220px] rounded-xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #0F0F13 0%, #E1060033 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div className="h-1 w-full bg-f1-red" />
      <div className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">
            F1 2026 · ROUND {race.round}
          </div>
          <div className="text-white text-xl font-bold">
            {race.flag} {race.grandPrixName}
          </div>
          <div className="text-gray-400 text-sm">{race.venue}</div>
        </div>

        {race.p1Winner && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#F5C518] text-xs font-bold w-6">P1</span>
              <span className="text-white text-sm font-medium">{race.p1Winner}</span>
            </div>
            {race.p2 && (
              <div className="flex items-center gap-2">
                <span className="text-[#BFC0C0] text-xs font-bold w-6">P2</span>
                <span className="text-gray-300 text-sm">{race.p2}</span>
              </div>
            )}
            {race.p3 && (
              <div className="flex items-center gap-2">
                <span className="text-[#CD7F32] text-xs font-bold w-6">P3</span>
                <span className="text-gray-300 text-sm">{race.p3}</span>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/30 flex items-center px-5">
          <span className="text-[10px] text-gray-500">f1tracker2026.com</span>
        </div>
      </div>
    </div>
  );
}

export function useShareCard() {
  const cardRef = useRef(null);

  const shareOrDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0F0F13',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'f1-share-card.png', { type: 'image/png' });

      // Try native Web Share API first
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'F1 2026 Season Tracker',
          files: [file],
        });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'f1-share-card.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }, []);

  return { cardRef, shareOrDownload };
}
