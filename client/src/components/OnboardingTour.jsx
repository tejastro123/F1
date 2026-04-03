import { useState, useEffect } from 'react';
import * as reactJoyride from 'react-joyride';
const Joyride = reactJoyride.default || reactJoyride.Joyride || reactJoyride;
const STATUS = reactJoyride.STATUS || { FINISHED: 'finished', SKIPPED: 'skipped' };
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'f1-tour-completed';

// Hook to manage tour completion status
export function useTourStatus() {
  const [completed, setCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  const startTour = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompleted(false);
  };

  return { completed, startTour, setCompleted };
}

// Base tour steps (common to all routes)
const baseTourSteps = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to F1 Command Center 2026',
    content: 'Your mission brief begins now. This quick tour will guide you through the key features of the system. Let\'s deploy.',
    disableBeacon: true,
    disableOverlayClose: true,
    showSkipButton: true,
    showProgress: true,
  },
  {
    target: '[data-tour="nav-home"]',
    placement: 'bottom',
    title: 'Navigation Hub',
    content: 'Access the main command sectors: Drivers, Constructors, Calendar, Predictions, and more. All critical intel at your fingertips.',
    disableBeacon: false,
  },
  {
    target: '[data-tour="nav-live"]',
    placement: 'bottom',
    title: 'Live Grid Access',
    content: 'Real-time race telemetry and live streaming. This sector comes alive during Grand Prix weekends.',
    disableBeacon: false,
  },
  {
    target: '[data-tour="theme-toggle"]',
    placement: 'right',
    title: 'Operational Theme',
    content: 'Switch between dark and light operational modes. The system automatically detects your preference.',
    disableBeacon: false,
  },
];

// Route-specific ending steps
const routeSpecificSteps = {
  '/': [
    {
      target: '[data-tour="home-stats"]',
      placement: 'bottom',
      title: 'System Telemetry',
      content: 'Real-time championship standings, driver rankings, and mission-critical statistics.',
      disableBeacon: false,
    },
    {
      target: '[data-tour="home-countdown"]',
      placement: 'bottom',
      title: 'Next Mission Countdown',
      content: 'Precision countdown to the next Grand Prix. Never miss a deadline.',
      disableBeacon: false,
    },
    {
      target: '[data-tour="predictions"]',
      placement: 'bottom',
      title: 'Predictions Sector',
      content: 'Deploy your race predictions across 11 strategic categories. Climb the global leaderboard with accurate calls.',
      disableBeacon: false,
    },
    {
      target: '[data-tour="leaderboard"]',
      placement: 'bottom',
      title: 'Global Leaderboard',
      content: 'Compete with predictors worldwide. Track your accuracy percentage and climb the ranks.',
      disableBeacon: false,
    },
  ],
  '/drivers': [
    {
      target: '[data-tour="drivers-list"]',
      placement: 'bottom',
      title: 'Driver Standings',
      content: 'View the complete 2026 Driver Championship standings. Click any driver for detailed telemetry.',
      disableBeacon: false,
    },
  ],
  '/predictions': [
    {
      target: '[data-tour="predictions-accuracy"]',
      placement: 'bottom',
      title: 'Your Prediction Accuracy',
      content: 'Track your prediction success rate across all categories. Every correct call brings you closer to the podium.',
      disableBeacon: false,
    },
  ],
  '/leaderboard': [
    {
      target: '[data-tour="leaderboard-ranks"]',
      placement: 'bottom',
      title: 'Top Predictors',
      content: 'The global leaderboard showcasing the most accurate F1 predictors. Can you reach the top?',
      disableBeacon: false,
    },
  ],
};

// Final step common to all routes
const finalStep = {
  target: '[data-tour="tour-end"]',
  placement: 'top',
  title: 'Mission Briefing Complete',
  content: 'You\'re now authorized to operate the F1 Command Center. Good luck out there!',
  disableBeacon: true,
};

// Build steps for a given route
function getStepsForRoute(pathname) {
  const specific = routeSpecificSteps[pathname] || routeSpecificSteps['/'];
  return [...baseTourSteps, ...specific, finalStep];
}

// Tour component
export function OnboardingTour({ isOpen, onClose }) {
  const [run, setRun] = useState(isOpen);
  const location = useLocation();

  useEffect(() => {
    setRun(isOpen);
  }, [isOpen]);

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;

    if (type === 'tour:end' || type === 'tour:skip' || status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onClose();
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const joyrideStyles = {
    overlay: {
      backgroundColor: 'rgba(10, 10, 14, 0.95)',
    },
    spotlight: {
      borderRadius: '0.5rem',
    },
    tooltip: {
      borderRadius: '1.5rem',
      padding: '1.5rem',
    },
    options: {
      primaryColor: '#E10600',
      textColor: '#FFFFFF',
      zIndex: 10000,
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: 700,
      marginBottom: '0.75rem',
      fontFamily: 'Inter, sans-serif',
    },
    description: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    buttonNext: {
      backgroundColor: '#E10600',
      borderRadius: '9999px',
      padding: '0.5rem 1.5rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    buttonBack: {
      borderRadius: '9999px',
      padding: '0.5rem 1.5rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'rgba(255,255,255,0.6)',
    },
    tooltipArrow: {
      width: 20,
      height: 20,
    },
    progress: {
      color: 'rgba(255,255,255,0.4)',
    },
    tooltipContainer: {
      textAlign: 'left',
    },
  };

  const buttonText = {
    skip: 'ABORT MISSION',
    next: 'DEPLOY',
    back: 'RETREAT',
  };

  return (
    <Joyride
      steps={getStepsForRoute(location.pathname)}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      styles={joyrideStyles}
      autoStart={false}
      scrollToFirstStep={true}
      scrollOffset={80}
      disableScrollParentFix={true}
      spotlightPadding={8}
      overlayColor="rgba(10, 10, 14, 0.85)"
      arrowColor="#1C1C28"
      borderRadius="1.5rem"
      buttonText={buttonText}
    />
  );
}
