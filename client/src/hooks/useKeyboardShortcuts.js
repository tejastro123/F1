import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ROUTES = {
  h: '/',
  d: '/drivers',
  c: '/constructors',
  r: '/calendar',
  l: '/live',
  n: '/news',
  s: '/stats',
  p: '/predictions',
};

/**
 * useKeyboardShortcuts — Global keyboard navigation
 * 
 * Cmd/Ctrl+K → Open global search
 * G then H/D/C/R/L/N/S/P → Navigate to route
 * ? → Show shortcuts help
 * Esc → Close any overlay
 */
export function useKeyboardShortcuts({ onOpenSearch, onToggleHelp }) {
  const navigate = useNavigate();
  const gPressedRef = useRef(false);
  const gTimerRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName.toLowerCase();
      const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

      // Cmd/Ctrl+K → Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Don't fire navigation shortcuts in text fields
      if (isEditable) return;

      // ? → Toggle help overlay
      if (e.key === '?' && !e.shiftKey) {
        onToggleHelp?.();
        return;
      }

      // G-prefix navigation (press G, then a letter within 1s)
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPressedRef.current = true;
        clearTimeout(gTimerRef.current);
        gTimerRef.current = setTimeout(() => { gPressedRef.current = false; }, 1000);
        return;
      }

      if (gPressedRef.current) {
        const route = ROUTES[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          gPressedRef.current = false;
          clearTimeout(gTimerRef.current);
          navigate(route);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimerRef.current);
    };
  }, [navigate, onOpenSearch, onToggleHelp]);
}
