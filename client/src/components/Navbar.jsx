import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useSocket } from '../context/SocketContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../context/DashboardContext.jsx';
import { Button } from './ui.jsx';
import { useTourStatus, OnboardingTour } from './OnboardingTour.jsx';
import { DashboardConfigButton, DashboardConfigModal } from './DashboardConfig.jsx';

export default function Navbar({ onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const { isConnected, lastBroadcast } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { setIsConfiguring } = useDashboard();
  const { completed: tourCompleted, startTour: restartTour } = useTourStatus();
  const location = useLocation();
  const menuRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const handleGoogleLogin = () => {
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

  // Touch gesture handlers for swipe-to-close
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    // Swipe down threshold (100px) to close menu
    if (diff > 100) {
      setMobileOpen(false);
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

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
    ...(isAuthenticated ? [{ to: '/favorites', label: 'Favorites' }] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex justify-center ${
          scrolled 
            ? 'bg-f1-dark/80 backdrop-blur-[40px] border-b border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] py-3 px-6 lg:px-12' 
            : 'py-8 px-6 lg:px-12 bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={`w-full max-w-[100rem] grid grid-cols-2 xl:grid-cols-[1fr_auto_1fr] items-center transition-all duration-700 gap-4 ${scrolled ? 'h-12' : 'h-14'}`}>
          {/* Logo - Elite Styling */}
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group w-fit" data-tour="nav-home">
              <div className="relative">
                <span className="text-f1-red font-black text-3xl tracking-tighter italic drop-shadow-[0_0_10px_rgba(225,6,0,0.3)]">F1</span>
                <div className="absolute -inset-1 bg-f1-red/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className={`flex flex-col transition-all overflow-hidden ${scrolled ? 'hidden md:flex' : 'flex'}`}>
                <span className="text-white font-black text-[10px] tracking-[0.3em] uppercase leading-none">Command</span>
                <span className="text-gray-500 font-black text-[8px] tracking-[0.3em] uppercase leading-none mt-1">Center 2026</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav - Centered perfectly */}
          <div className="hidden xl:flex items-center justify-center gap-1.5 w-full">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 rounded-xl group ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{link.label}</span>
                    <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl shadow-[0_5px_15px_-5px_rgba(255,255,255,0.1)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Live button - Prominent Design */}
            <NavLink
              to="/live"
              data-tour="nav-live"
              className={({ isActive }) =>
                `ml-4 relative px-6 py-2.5 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] overflow-hidden group hover:scale-[1.02] ${
                  isActive
                    ? 'bg-f1-red/10 border-f1-red text-white shadow-[0_0_20px_rgba(225,6,0,0.3)]'
                    : lastBroadcast
                    ? 'bg-white/5 border-f1-red/50 text-white shadow-[0_0_15px_rgba(225,6,0,0.15)] hover:border-f1-red hover:bg-f1-red/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="relative">
                      <span className={`block w-2.5 h-2.5 rounded-full ${
                        lastBroadcast ? 'bg-f1-red animate-live-pulse' : isConnected ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                      {lastBroadcast && <div className="absolute inset-0 bg-f1-red/50 rounded-full animate-ping" />}
                    </div>
                    <span className="group-hover:text-white transition-colors">Live Grid</span>
                  </div>
                  {(isActive || lastBroadcast) && (
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  )}
                </>
              )}
            </NavLink>
          </div>

          {/* Controls & User */}
          <div className="flex items-center justify-end gap-2.5">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              aria-label="Open search (Cmd+K)"
              title="Search (⌘K)"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m21 21-3.5-3.5" />
              </svg>
            </button>

            {/* Theme Toggle - Squircle update */}
            <button
              onClick={toggleTheme}
              data-tour="theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-90"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Tour Replay Button */}
            {tourCompleted ? (
              <button
                onClick={restartTour}
                className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white transition-all hover:bg-f1-red/10 hover:border-f1-red/30 hover:text-f1-red active:scale-90"
                title="Replay Tour"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ) : null}

            {/* Dashboard Config Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsConfiguring(true)}
                className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}

            {/* User - Squircle Update */}
            {isAuthenticated && user ? (
              <Link to="/profile" className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-2xl pl-1.5 pr-4 py-1.5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group ml-1 shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover border border-white/10 group-hover:border-f1-red/50 transition-colors shadow-sm shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-f1-red to-red-900 border border-f1-red/30 text-white flex items-center justify-center font-black text-xs shadow-inner shrink-0">
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:block text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[80px]">{user.displayName?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Button
                onClick={handleGoogleLogin}
                className="!px-6 !py-2.5 !text-[10px] uppercase tracking-[0.2em] !shrink-0 ml-1"
                variant="primary"
              >
                Join Grid
              </Button>
            )}

            {/* Menu Toggle - Mobile Only */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white transition-all active:scale-90 hover:bg-white/10 ml-1"
            >
              <div className="w-5 flex flex-col gap-[5px] items-end" aria-hidden="true">
                <motion.span animate={mobileOpen ? { rotate: 45, y: 7, width: 20 } : { rotate: 0, y: 0, width: 20 }} className="h-[2px] bg-white block rounded-full origin-right" />
                <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1, width: 14 }} className="h-[2px] bg-white block rounded-full" />
                <motion.span animate={mobileOpen ? { rotate: -45, y: -7, width: 20 } : { rotate: 0, y: 0, width: 20 }} className="h-[2px] bg-white block rounded-full origin-right" />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Elite Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(32px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[90] bg-f1-dark/95 xl:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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

      {/* Onboarding Tour */}
      <OnboardingTour isOpen={runTour} onClose={() => setRunTour(false)} />

      {/* Dashboard Configuration Modal */}
      <DashboardConfigModal />
    </>
  );
}
