import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context/DashboardContext.jsx';
import { X, Eye, EyeOff, RotateCcw } from 'lucide-react';

export function DashboardConfigModal() {
  const {
    widgets,
    isConfiguring,
    setIsConfiguring,
    toggleWidget,
    resetToDefaults,
  } = useDashboard();

  if (!isConfiguring) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-f1-dark/80 backdrop-blur-xl p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsConfiguring(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-f1-card border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                DASHBOARD CONFIGURATION
              </h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                Customize your command center layout
              </p>
            </div>
            <button
              onClick={() => setIsConfiguring(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close configuration"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Widget List */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-4">
              {widgets.map((widget, idx) => (
                <motion.div
                  key={widget.id}
                  layout
                  className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-f1-red/10 text-f1-red font-black text-sm">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        {widget.title}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Widget ID: {widget.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      aria-label={widget.visible ? 'Hide widget' : 'Show widget'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        widget.visible
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {widget.visible ? (
                        <>
                          <Eye className="w-4 h-4" />
                          VISIBLE
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          HIDDEN
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Preview hint */}
            <div className="mt-8 p-6 bg-f1-red/5 border border-f1-red/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-f1-red/20 text-f1-red">
                  ℹ
                </div>
                <div className="text-sm text-gray-300">
                  <p className="font-bold mb-1">How it works</p>
                  <p>
                    Toggle widgets to customize your homepage. Changes are saved automatically
                    to your browser settings and will persist across sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-8 border-t border-white/5 bg-white/[0.02]">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              onClick={() => setIsConfiguring(false)}
              className="px-10 py-4 rounded-xl bg-f1-red hover:bg-red-600 text-white text-sm font-black uppercase tracking-widest transition-colors shadow-lg shadow-f1-red/20"
            >
              Save & Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Small floating button to open config (shown in navbar for authenticated users, can also be added to page)
export function DashboardConfigButton() {
  const { setIsConfiguring, widgets } = useDashboard();
  const customCount = widgets.filter(w => !w.visible).length;

  return (
    <button
      onClick={() => setIsConfiguring(true)}
      aria-label="Customize dashboard"
      title="Customize Dashboard"
      className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {customCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-f1-red rounded-full text-[10px] font-black text-white flex items-center justify-center">
          {customCount}
        </span>
      )}
    </button>
  );
}
