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

// Specialized skeletons matching actual component shapes

// StatPill component skeleton (used on homepage)
export function SkeletonStatPill() {
  return (
    <div className="flex items-center gap-4 bg-white/[0.02] backdrop-blur-xl rounded-2xl px-6 py-5 border border-white/5">
      <div className="w-8 h-8 bg-white/10 rounded-full shimmer" />
      <div className="flex-1">
        <div className="h-3 w-16 bg-white/10 rounded-full mb-2 shimmer" />
        <div className="h-6 w-12 bg-white/5 rounded-full shimmer" />
      </div>
    </div>
  );
}

// Driver card skeleton (mobile view)
export function SkeletonDriverCard() {
  return (
    <div className="glass-card !p-6 flex items-center gap-6 border border-white/5 overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-2 bg-white/5" />
      <div className="flex flex-col items-center justify-center min-w-[40px] gap-1">
        <div className="w-8 h-8 bg-white/10 rounded shimmer" />
        <div className="w-6 h-2 bg-white/5 rounded shimmer" />
      </div>
      <div className="flex-1">
        <div className="h-5 w-3/4 bg-white/10 rounded mb-2 shimmer" />
        <div className="h-3 w-1/2 bg-white/5 rounded shimmer" />
      </div>
      <div className="text-right">
        <div className="h-6 w-12 bg-white/10 rounded shimmer" />
      </div>
    </div>
  );
}

// Prediction card skeleton
export function SkeletonPredictionCard() {
  return (
    <div className="glass-card h-full rounded-[2rem] p-6 border border-white/5">
      <div className="flex justify-between items-start mb-6">
        <div className="h-4 w-20 bg-white/10 rounded-full shimmer" />
        <div className="h-5 w-16 bg-white/5 rounded-full shimmer" />
      </div>
      <div className="mb-8">
        <div className="h-3 w-20 bg-white/10 rounded mb-2 shimmer" />
        <div className="h-6 w-3/4 bg-white/5 rounded shimmer" />
      </div>
      <div className="pt-4 border-t border-white/5 flex justify-between">
        <div className="w-24">
          <div className="h-2 w-full bg-white/5 rounded mb-2 shimmer" />
          <div className="h-5 w-20 bg-white/10 rounded shimmer" />
        </div>
        <div className="w-6 h-6 bg-white/5 rounded-full shimmer" />
      </div>
    </div>
  );
}

// News card skeleton (for news feed)
export function SkeletonNewsCard() {
  return (
    <div className="glass-card h-full border border-white/5 overflow-hidden !p-0">
      <div className="h-48 bg-white/5 shimmer" />
      <div className="p-8 space-y-4">
        <div className="h-4 w-20 bg-white/10 rounded-full shimmer" />
        <div className="h-6 w-3/4 bg-white/10 rounded shimmer" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded shimmer" />
          <div className="h-3 w-2/3 bg-white/5 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

// Driver table row skeleton (desktop view)
export function SkeletonDriverTableRow() {
  return (
    <tr className="group">
      <td className="bg-white/5 rounded-l-[1.5rem] border-y border-l border-white/5 py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-white/10 rounded-full shimmer" />
          <div className="w-6 h-6 bg-white/10 rounded shimmer" />
        </div>
      </td>
      <td className="bg-white/5 border-y border-white/5 py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/5 shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-white/10 rounded shimmer" />
            <div className="h-3 w-32 bg-white/5 rounded shimmer" />
          </div>
        </div>
      </td>
      <td className="bg-white/5 border-y border-white/5 py-5 px-6">
        <div className="h-4 w-24 bg-white/10 rounded shimmer" />
      </td>
      <td className="bg-white/5 border-y border-white/5 py-5 px-6 text-right">
        <div className="h-6 w-16 bg-white/10 rounded-full shimmer ml-auto" />
      </td>
      <td className="bg-white/5 rounded-r-[1.5rem] border-y border-r border-white/5 py-5 px-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-12 bg-white/5 rounded shimmer" />
            <div className="h-3 w-12 bg-white/5 rounded shimmer" />
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full shimmer" />
        </div>
      </td>
    </tr>
  );
}

// Race card skeleton (for calendar/races)
export function SkeletonRaceCard() {
  return (
    <div className="glass-card !p-0 overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="p-12 md:p-20 bg-white/[0.01] space-y-6">
          <div className="h-20 w-20 bg-white/5 rounded-full shimmer mx-auto" />
          <div className="h-8 w-3/4 bg-white/10 rounded shimmer mx-auto" />
          <div className="h-4 w-1/2 bg-white/5 rounded shimmer mx-auto" />
        </div>
        <div className="p-12 md:p-20 space-y-6">
          <div className="h-4 w-full bg-white/5 rounded shimmer" />
          <div className="h-4 w-5/6 bg-white/5 rounded shimmer" />
          <div className="h-4 w-4/6 bg-white/5 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

// Creates a shimmer animation for custom elements
export const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
  }
  .light .shimmer {
    background: linear-gradient(90deg, rgba(0,0,0,0) 25%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0) 75%);
    background-size: 200% 100%;
  }
`;

export function EmptyState({
  icon = '📭',
  title = 'No Data Available',
  description = 'There is no data to display at this time.',
  action,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-32 px-6 text-center ${className}`}
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>
        <span className="relative text-8xl md:text-9xl drop-shadow-2xl opacity-60">{icon}</span>
      </div>

      <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 max-w-lg">
        {title}
      </h3>

      <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed max-w-md mb-8">
        {description}
      </p>

      {action && (
        <Button
          variant="primary"
          size="lg"
          onClick={action.onClick}
          className="!px-10 !py-4 text-xs uppercase tracking-[0.3em] font-bold"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

export function ComingSoon({ feature, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-32 px-6 text-center ${className}`}
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-f1-red/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <span className="relative text-8xl md:text-9xl">🚧</span>
      </div>

      <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
        UNDER CONSTRUCTION
      </h3>

      <p className="text-gray-400 text-sm md:text-base font-medium mb-2">
        {feature}
      </p>

      <p className="text-gray-600 text-xs uppercase tracking-widest">
        Deploying Soon
      </p>
    </motion.div>
  );
}

export function NoFavorites({ onExplore }) {
  return (
    <EmptyState
      icon="❤️"
      title="NO FAVORITES YET"
      description="Start building your personal watchlist by bookmarking drivers, teams, and races. Your curated command center awaits."
      action={
        onExplore ? {
          label: 'EXPLORE THE GRID',
          onClick: onExplore
        } : undefined
      }
      className="py-40"
    />
  );
}

export function NoPredictions({ onPredict }) {
  return (
    <EmptyState
      icon="🔮"
      title="EMPTY PREDICTION GRID"
      description="You haven't deployed any race predictions yet. Lock in your forecasts across 11 strategic categories and climb the leaderboard."
      action={
        onPredict ? {
          label: 'VIEW CALENDAR',
          onClick: onPredict
        } : undefined
      }
    />
  );
}

export function NoSearchResults({ query, onClear }) {
  return (
    <EmptyState
      icon="🎯"
      title="NO MATCHES FOUND"
      description={`We couldn't find any results matching "${query}". Try adjusting your search criteria.`}
      action={
        onClear ? {
          label: 'CLEAR FILTERS',
          onClick: onClear
        } : undefined
      }
    />
  );
}

export function NoRacesUpcoming() {
  return (
    <EmptyState
      icon="🏁"
      title="NO UPCOMING RACES"
      description="The season schedule is currently being updated. Check back soon for the next mission briefing."
    />
  );
}

export function NoRaceResults() {
  return (
    <EmptyState
      icon="📊"
      title="NO RACE DATA"
      description="Race results haven't been recorded yet. The first Grand Prix results will appear here once the checkered flag falls."
    />
  );
}

export function LastUpdatedChip({ timestamp, className = '' }) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const isValid = !isNaN(date.getTime());
  if (!isValid) return null;

  const formatted = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ${className}`}>
      <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full" />
      Data refreshed: {formatted}
    </span>
  );
}
