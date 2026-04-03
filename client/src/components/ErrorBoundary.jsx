import { Component } from 'react';
import { motion } from 'framer-motion';

function generateErrorId() {
  return 'ERR-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
}

// The visual 500 error page component
export function ServerErrorPage({ error, errorId, onReset }) {
  const isDev = import.meta.env.DEV;

  const copyErrorId = () => {
    navigator.clipboard.writeText(errorId).catch(() => {});
    const btn = document.getElementById('copy-error-btn');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Error ID'; }, 2000); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-f1-dark">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(225,6,0,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="text-[10rem] md:text-[14rem] font-black italic text-white/[0.04] leading-none select-none">
            500
          </div>
          <div className="-mt-16 md:-mt-24 relative">
            <div className="text-7xl md:text-8xl mb-4">💥</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-f1-red rounded-full" />
            <span className="text-[10px] font-bold text-f1-red uppercase tracking-[0.3em]">Critical System Failure</span>
            <div className="w-8 h-[2px] bg-f1-red rounded-full" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">
            ENGINE FAILURE
          </h1>
          <p className="text-gray-400 text-base font-medium leading-relaxed mb-8 max-w-md mx-auto">
            An unexpected error has occurred. Our engineers have been notified and are working to resolve the issue.
          </p>

          {/* Error ID */}
          <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 mb-8">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Error ID:</span>
            <span className="text-[11px] font-black text-f1-red font-mono tracking-widest">{errorId}</span>
            <button
              id="copy-error-btn"
              onClick={copyErrorId}
              className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest border border-white/10 hover:border-white/30 rounded-xl px-3 py-1.5 transition-all"
            >
              Copy Error ID
            </button>
          </div>

          {/* Dev Error Details */}
          {isDev && error && (
            <div className="text-left bg-black/50 border border-f1-red/20 rounded-2xl p-6 mb-8 font-mono text-xs overflow-auto max-h-40">
              <div className="text-f1-red font-black mb-2 uppercase tracking-widest text-[10px]">Dev Mode — Error Stack</div>
              <pre className="text-gray-400 whitespace-pre-wrap break-all">
                {error?.message}
                {'\n\n'}
                {error?.stack?.split('\n').slice(0, 6).join('\n')}
              </pre>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {onReset && (
            <button
              onClick={onReset}
              className="bg-f1-red hover:bg-red-600 text-white font-black rounded-2xl px-8 py-4 text-xs uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_-10px_rgba(225,6,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(225,6,0,0.7)] active:scale-95"
            >
              Try Again
            </button>
          )}
          <a
            href="/"
            className="bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 font-black rounded-2xl px-8 py-4 text-xs uppercase tracking-[0.3em] transition-all active:scale-95"
          >
            Return to Pit Lane
          </a>
          <a
            href={`https://github.com/issues/new?title=Error+${encodeURIComponent(errorId)}&body=${encodeURIComponent(`Error ID: ${errorId}\n\nError: ${error?.message || 'Unknown'}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/10 font-black rounded-2xl px-8 py-4 text-xs uppercase tracking-[0.3em] transition-all active:scale-95"
          >
            Report Issue
          </a>
        </motion.div>
      </div>
    </div>
  );
}

// The React Error Boundary class component
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          error={this.state.error}
          errorId={this.state.errorId}
          onReset={() => {
            this.setState({ hasError: false, error: null, errorId: null });
            window.location.reload();
          }}
        />
      );
    }
    return this.props.children;
  }
}
