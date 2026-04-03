import { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext(null);

// Default widget configuration
const defaultWidgets = [
  { id: 'stats', title: 'System Telemetry', visible: true, position: 0 },
  { id: 'countdown', title: 'Next Mission', visible: true, position: 1 },
  { id: 'latestRace', title: 'Event Archive', visible: true, position: 2 },
  { id: 'news', title: 'Latest Intelligence', visible: true, position: 3 },
  { id: 'playbook', title: 'Operation Playbook', visible: true, position: 4 },
];

const STORAGE_KEY = 'f1-dashboard-widgets';

export const DashboardProvider = ({ children }) => {
  const [widgets, setWidgets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse dashboard config:', e);
        }
      }
    }
    return defaultWidgets;
  });

  const [isConfiguring, setIsConfiguring] = useState(false);

  // Persist to localStorage whenever widgets change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }
  }, [widgets]);

  const toggleWidget = (widgetId) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    );
  };

  const reorderWidgets = (sourceIndex, destinationIndex) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(sourceIndex, 1);
      newWidgets.splice(destinationIndex, 0, removed);
      // Update positions
      return newWidgets.map((widget, idx) => ({ ...widget, position: idx }));
    });
  };

  const resetToDefaults = () => {
    setWidgets(defaultWidgets);
  };

  const getVisibleWidgets = () => {
    return widgets
      .filter(w => w.visible)
      .sort((a, b) => a.position - b.position);
  };

  return (
    <DashboardContext.Provider value={{
      widgets,
      visibleWidgets: getVisibleWidgets(),
      isConfiguring,
      setIsConfiguring,
      toggleWidget,
      reorderWidgets,
      resetToDefaults,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
};
