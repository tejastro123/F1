import { motion, useMotionValue, useSpring, useInView, useMotionTemplate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function AnimatedCounter({ value, duration = 1.2, className = '' }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest);
      }
    });
    return unsubscribe;
  }, [springValue]);

  return <span ref={ref} className={className}>0</span>;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const base = 'font-bold rounded-2xl transition-all duration-300 inline-flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-f1-red hover:bg-red-600 text-white shadow-[0_10px_30px_-10px_rgba(225,6,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(225,6,0,0.7)]',
    secondary: 'bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 backdrop-blur-2xl shadow-xl',
    gold: 'bg-f1-gold hover:bg-[#FFD700] text-black shadow-[0_10px_20px_-10px_rgba(255,215,0,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(255,215,0,0.5)]',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    admin: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/40',
    outline: 'bg-transparent border-2 border-white/10 hover:border-white/30 text-white backdrop-blur-sm',
  };
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base md:text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Card({ children, className = '', hover = true, glass = true, ...props }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2, ease: 'easeOut' } } : {}}
      onMouseMove={handleMouseMove}
      className={`relative group ${glass ? 'glass-card' : 'bento-card'} p-6 md:p-8 overflow-hidden ${className}`}
      {...props}
    >
      {/* Precision Rim Lighting */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(225, 6, 0, 0.05),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export function Badge({ children, color = 'red', className = '' }) {
  const colors = {
    red: 'bg-f1-red/10 text-f1-red border-f1-red/20',
    gold: 'bg-f1-gold/10 text-f1-gold border-f1-gold/20',
    silver: 'bg-f1-silver/10 text-f1-silver border-f1-silver/20',
    bronze: 'bg-f1-bronze/10 text-f1-bronze border-f1-bronze/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function StatPill({ label, value, icon, className = '' }) {
  return (
    <div className={`flex items-center gap-4 bg-white/[0.02] backdrop-blur-xl rounded-2xl px-6 py-5 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl group ${className}`}>
      {icon && <span className="text-xl drop-shadow-md">{icon}</span>}
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-bold text-white leading-tight tabular-nums">
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </p>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, className = '', align = 'left' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-12 ${align === 'center' ? 'text-center' : ''} ${className}`}
    >
      <div className={`flex items-center gap-3 mb-2 ${align === 'center' ? 'justify-center' : ''}`}>
        <div className="w-8 h-[2px] bg-f1-red rounded-full" />
        <span className="text-[10px] font-bold text-f1-red uppercase tracking-[0.3em]">Telemetry Signal</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase leading-none mb-4">
        {title}
      </h2>
      {subtitle && <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed uppercase tracking-wider">{subtitle}</p>}
    </motion.div>
  );
}

export function TeamColorStripe({ team, className = '' }) {
  const teamColors = {
    'Mercedes': '#27F4D2', 'Ferrari': '#E8002D', 'Red Bull': '#3671C6',
    'McLaren': '#FF8000', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
    'Williams': '#1868DB', 'RB': '#6692FF', 'Haas': '#B6BABD',
    'Audi': '#FF0000', 'Cadillac': '#DAA520',
  };
  return (
    <div
      className={`w-1 rounded-full ${className}`}
      style={{ backgroundColor: teamColors[team] || '#666' }}
    />
  );
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} border-2 border-f1-card border-t-f1-red rounded-full animate-spin`} />
    </div>
  );
}

export function RaceStatusBadge({ status }) {
  if (status === 'completed') {
    return <Badge color="green">✓ Completed</Badge>;
  }
  return <Badge color="orange">Upcoming</Badge>;
}

export function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/5 rounded-full animate-pulse"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 animate-pulse relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      <div className="h-4 w-1/4 bg-white/10 rounded-full mb-8" />
      <div className="h-12 w-3/4 bg-white/5 rounded-2xl mb-4" />
      <div className="h-4 w-1/2 bg-white/5 rounded-full mb-10" />
      <div className="h-16 w-full bg-white/5 rounded-3xl" />
    </div>
  );
}
