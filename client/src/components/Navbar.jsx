import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './ui.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected, lastBroadcast } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleGoogleLogin = () => {
    // Redirects browser straight to backend Google OAuth flow
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`;
  };

  const handleDiscordLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/discord`;
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/drivers', label: 'Drivers' },
    { to: '/constructors', label: 'Constructors' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/predictions', label: 'My Predictions' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/stats', label: 'Stats' },
    { to: '/news', label: 'Intelligence' },
    { to: '/oracle', label: 'Oracle' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
          scrolled ? 'py-4 bg-[#0A0A0E]/60 backdrop-blur-[40px] border-b border-white/5 shadow-2xl shadow-black/60' : 'py-8 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Elite Styling */}
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
              <div className="relative">
                <span className="text-f1-red font-black text-3xl tracking-tighter italic">F1</span>
                <div className="absolute -inset-1 bg-f1-red/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-[10px] tracking-[0.3em] uppercase leading-none">Command</span>
                <span className="text-gray-500 font-black text-[8px] tracking-[0.3em] uppercase leading-none mt-1">Center 2026</span>
              </div>
            </Link>

            {/* Desktop Nav - Refined */}
            <div className="hidden xl:flex items-center gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-full shadow-[0_5px_15px_-5px_rgba(255,255,255,0.1)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Live button - Distinctive */}
              <NavLink
                to="/live"
                className={({ isActive }) =>
                  `ml-4 relative px-5 py-2 rounded-full border transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-f1-red/10 border-f1-red text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <div className="relative">
                  <span className={`block w-2 h-2 rounded-full ${
                    lastBroadcast ? 'bg-f1-red animate-live-pulse' : isConnected ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                  {lastBroadcast && <div className="absolute inset-0 bg-f1-red/50 rounded-full animate-ping" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-f1-red transition-colors">Live Grid</span>
              </NavLink>
            </div>

            {/* Controls & User */}
            <div className="flex items-center gap-4">
              {/* User - Premium Fit */}
              {isAuthenticated && user ? (
                <Link to="/profile" className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full pl-1.5 pr-4 py-1.5 hover:bg-white/10 transition-all active:scale-95 group">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border-2 border-white/10 group-hover:border-f1-red/50 transition-colors" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-f1-red to-f1-red/50 text-white flex items-center justify-center font-black text-xs">
                      {(user.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:block text-[10px] font-black text-white uppercase tracking-widest">{user.displayName?.split(' ')[0]}</span>
                </Link>
              ) : (
                <Button 
                  onClick={handleGoogleLogin}
                  className="!px-8 !py-2.5 !text-[10px] uppercase tracking-[0.2em]"
                >
                  Join the Grid
                </Button>
              )}

              {/* Menu Toggle - Mobile Only */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition-all active:scale-90"
              >
                <div className="w-6 flex flex-col gap-1.5 items-end">
                  <motion.span
                    animate={mobileOpen ? { rotate: 45, y: 7, width: 24 } : { rotate: 0, y: 0, width: 24 }}
                    className="h-0.5 bg-white block rounded-full"
                  />
                  <motion.span
                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1, width: 16 }}
                    className="h-0.5 bg-white block rounded-full"
                  />
                  <motion.span
                    animate={mobileOpen ? { rotate: -45, y: -7, width: 24 } : { rotate: 0, y: 0, width: 24 }}
                    className="h-0.5 bg-white block rounded-full"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Elite Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(32px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[90] bg-f1-dark/95 xl:hidden flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              {[...links, { to: '/live', label: 'Live Grid' }].map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
                  className="w-full text-center"
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block text-5xl md:text-7xl font-black uppercase italic tracking-tighter py-2 transition-all ${
                        isActive ? 'text-f1-red' : 'text-white hover:text-f1-red/50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
            
            <div className="p-12 text-center border-t border-white/5 bg-white/[0.02]">
               <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Official 2026 Partner</div>
               <div className="flex justify-center gap-8 opacity-40">
                  <span className="font-black italic text-lg text-white">ORACLE</span>
                  <span className="font-black italic text-lg text-white">ROLEX</span>
                  <span className="font-black italic text-lg text-white">AWS</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
