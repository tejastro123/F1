import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open search', category: 'Global' },
  { keys: ['?'], description: 'Show this overlay', category: 'Global' },
  { keys: ['Esc'], description: 'Close modal / overlay', category: 'Global' },
  { keys: ['G', 'H'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['G', 'D'], description: 'Go to Drivers', category: 'Navigation' },
  { keys: ['G', 'C'], description: 'Go to Constructors', category: 'Navigation' },
  { keys: ['G', 'R'], description: 'Go to Calendar (Races)', category: 'Navigation' },
  { keys: ['G', 'L'], description: 'Go to Live Center', category: 'Navigation' },
  { keys: ['G', 'N'], description: 'Go to News', category: 'Navigation' },
  { keys: ['G', 'S'], description: 'Go to Stats', category: 'Navigation' },
  { keys: ['G', 'P'], description: 'Go to Predictions', category: 'Navigation' },
];

const CATEGORIES = ['Global', 'Navigation'];

export default function KeyboardShortcutsOverlay({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="ks-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
          />

          <motion.div
            key="ks-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-lg px-4"
          >
            <div className="bg-f1-card border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-4 h-[2px] bg-f1-red rounded-full" />
                    <span className="text-[9px] font-bold text-f1-red uppercase tracking-[0.3em]">Command Center</span>
                  </div>
                  <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {CATEGORIES.map(category => (
                  <div key={category}>
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">{category}</div>
                    <div className="space-y-1">
                      {SHORTCUTS.filter(s => s.category === category).map((shortcut) => (
                        <div
                          key={shortcut.description}
                          className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-white/[0.03] transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-400">{shortcut.description}</span>
                          <div className="flex items-center gap-1.5">
                            {shortcut.keys.map((key, i) => (
                              <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-gray-700 text-[10px]">then</span>}
                                <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-black text-gray-400 font-mono">
                                  {key}
                                </kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest text-center">
                  Press <kbd className="inline-flex items-center px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-gray-500 mx-1">?</kbd> to toggle · <kbd className="inline-flex items-center px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-gray-500 mx-1">Esc</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
