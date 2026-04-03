import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrivers } from '../hooks/useData.jsx';
import { useConstructors } from '../hooks/useData.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { drivers } = useDrivers();
  const { constructors } = useConstructors();

  // Filter results
  const driverResults = query.trim().length >= 1
    ? drivers.filter(d =>
        d.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        d.team?.toLowerCase().includes(query.toLowerCase()) ||
        d.nationality?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const constructorResults = query.trim().length >= 1
    ? constructors.filter(c =>
        c.teamName?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const totalResults = [...driverResults, ...constructorResults];

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Navigation shortcuts
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, totalResults.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && totalResults.length > 0) {
      e.preventDefault();
      const item = totalResults[selectedIdx];
      if (item) selectItem(item);
    }
  }, [isOpen, totalResults, selectedIdx]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset selection when results change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  function selectItem(item) {
    if (item.fullName) {
      navigate(`/drivers/${item._id}`);
    } else {
      navigate(`/constructors/${item._id}`);
    }
    onClose();
  }

  const allResults = [
    ...driverResults.map(d => ({ ...d, type: 'driver' })),
    ...constructorResults.map(c => ({ ...c, type: 'constructor' })),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="search-modal"
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[201] w-full max-w-xl px-4"
          >
            <div className="bg-f1-card border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500 flex-shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search drivers, constructors..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-base font-medium"
                  id="global-search-input"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-600 uppercase">
                  Esc
                </kbd>
              </div>

              {/* Results */}
              {query.trim().length >= 1 && (
                <div className="max-h-80 overflow-y-auto py-2">
                  {allResults.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-sm font-black text-gray-600 uppercase tracking-widest">No matches found</p>
                    </div>
                  ) : (
                    <>
                      {driverResults.length > 0 && (
                        <>
                          <div className="px-6 py-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Drivers</div>
                          {driverResults.map((driver, i) => (
                            <button
                              key={driver._id}
                              onClick={() => selectItem({ ...driver, type: 'driver' })}
                              className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors ${selectedIdx === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                            >
                              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(driver.team) }} />
                              {driver.photoUrl ? (
                                <img src={driver.photoUrl} alt={driver.fullName} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs">👤</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-white uppercase italic truncate">{driver.fullName}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getTeamColor(driver.team) }}>{driver.team}</div>
                              </div>
                              <div className="text-xs font-black text-gray-600 tabular-nums">P{driver.rank} — {driver.points} pts</div>
                            </button>
                          ))}
                        </>
                      )}

                      {constructorResults.length > 0 && (
                        <>
                          <div className="px-6 py-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] border-t border-white/5 mt-1 pt-3">Constructors</div>
                          {constructorResults.map((team, i) => (
                            <button
                              key={team._id}
                              onClick={() => selectItem({ ...team, type: 'constructor' })}
                              className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors ${selectedIdx === driverResults.length + i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                            >
                              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: getTeamColor(team.teamName) }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-black uppercase italic tracking-tighter" style={{ color: getTeamColor(team.teamName) }}>{team.teamName}</div>
                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Constructor · P{team.rank}</div>
                              </div>
                              <div className="text-xs font-black text-gray-600 tabular-nums">{team.points} pts</div>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Footer hint */}
              {query.trim().length < 1 && (
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Type to search the grid</span>
                  <div className="flex items-center gap-2">
                    <kbd className="inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gray-600">↑↓</kbd>
                    <span className="text-[9px] text-gray-700">Navigate</span>
                    <kbd className="inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gray-600">↵</kbd>
                    <span className="text-[9px] text-gray-700">Select</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
