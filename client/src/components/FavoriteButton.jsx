import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFavorites } from '../context/FavoritesContext.jsx';

export function FavoriteButton({ type, id, size = 'md', showLabel = false }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const favorited = isFavorited(type, id);

  const handleClick = async (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    await toggleFavorite(type, id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`relative flex items-center justify-center ${sizes[size]} rounded-full transition-colors ${
        favorited
          ? 'bg-f1-red/10 text-f1-red border border-f1-red/30 hover:bg-f1-red/20'
          : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'
      }`}
      whileTap={{ scale: 0.9 }}
      animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
    >
      <svg
        className="w-4 h-4 md:w-5 md:h-5"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      {showLabel && (
        <span className="ml-2 text-xs font-black uppercase tracking-wider">
          {favorited ? 'SAVED' : 'SAVE'}
        </span>
      )}
    </motion.button>
  );
}

// Compact version for inline use (like in driver table rows)
export function FavoriteIcon({ type, id, className = '' }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const favorited = isFavorited(type, id);

  const handleClick = async (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    await toggleFavorite(type, id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label={favorited ? 'Remove favorite' : 'Add favorite'}
      className={`p-1.5 rounded-full transition-colors ${className} ${
        favorited
          ? 'text-f1-red'
          : 'text-gray-500 hover:text-white'
      }`}
      whileTap={{ scale: 0.85 }}
      animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
    >
      <svg
        className="w-4 h-4"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </motion.button>
  );
}
