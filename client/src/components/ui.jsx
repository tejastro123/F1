import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
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
  const base = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-f1-red hover:bg-red-700 text-white shadow-lg shadow-f1-red/20 hover:shadow-f1-red/40',
    secondary: 'bg-f1-card hover:bg-f1-panel text-white border border-white/10',
    gold: 'bg-f1-gold hover:bg-yellow-500 text-black',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    admin: 'bg-f1-admin hover:bg-orange-600 text-white',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`bg-f1-card rounded-xl border border-white/5 p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, color = 'red', className = '' }) {
  const colors = {
    red: 'bg-f1-red/20 text-f1-red border-f1-red/30',
    gold: 'bg-f1-gold/20 text-f1-gold border-f1-gold/30',
    silver: 'bg-f1-silver/20 text-f1-silver border-f1-silver/30',
    bronze: 'bg-f1-bronze/20 text-f1-bronze border-f1-bronze/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function StatPill({ label, value, icon, className = '' }) {
  return (
    <div className={`flex items-center gap-3 bg-f1-panel rounded-xl px-4 py-3 border border-white/5 ${className}`}>
      {icon && <span className="text-xl">{icon}</span>}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-white">
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </p>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`mb-8 ${className}`}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        {title}
      </h2>
      {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      <div className="w-16 h-1 bg-f1-red rounded-full mt-3" />
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
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-f1-card rounded-xl border border-white/5 p-6">
      <div className="skeleton h-6 w-3/4 rounded mb-4" />
      <div className="skeleton h-4 w-1/2 rounded mb-2" />
      <div className="skeleton h-4 w-2/3 rounded mb-2" />
      <div className="skeleton h-10 w-full rounded mt-4" />
    </div>
  );
}
