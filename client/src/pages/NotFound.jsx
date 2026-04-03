import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const navLinks = [
  { label: 'Home', to: '/', icon: '🏠' },
  { label: 'Drivers', to: '/drivers', icon: '👤' },
  { label: 'Constructors', to: '/constructors', icon: '🏎' },
  { label: 'Calendar', to: '/calendar', icon: '📅' },
  { label: 'Live', to: '/live', icon: '📡' },
  { label: 'News', to: '/news', icon: '📰' },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | F1 2026</title>
        <meta name="description" content="This page doesn't exist in the F1 2026 Season Tracker." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(225,6,0,0.06),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <div className="text-[10rem] md:text-[14rem] font-black italic text-white/[0.04] leading-none select-none">
              404
            </div>
            <div className="-mt-16 md:-mt-24 relative">
              <div className="text-7xl md:text-8xl mb-4">🏁</div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-f1-red rounded-full" />
              <span className="text-[10px] font-bold text-f1-red uppercase tracking-[0.3em]">Signal Lost</span>
              <div className="w-8 h-[2px] bg-f1-red rounded-full" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">
              OFF THE TRACK
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed mb-12 max-w-md mx-auto">
              The page you're looking for has spun off the racing line. Let's get you back to the pit lane.
            </p>
          </motion.div>

          {/* Navigation Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10"
          >
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + idx * 0.06 }}
              >
                <Link
                  to={link.to}
                  className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-2xl px-5 py-4 transition-all group"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-f1-red transition-colors">
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="text-[11px] font-black text-gray-600 hover:text-f1-red uppercase tracking-[0.3em] transition-colors group flex items-center gap-2 mx-auto"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Go Back
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
