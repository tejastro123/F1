import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Navbar.jsx';
import { LoadingSpinner } from './components/ui.jsx';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Drivers = lazy(() => import('./pages/Drivers.jsx'));
const DriverDetail = lazy(() => import('./pages/DriverDetail.jsx'));
const Constructors = lazy(() => import('./pages/Constructors.jsx'));
const ConstructorDetail = lazy(() => import('./pages/ConstructorDetail.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const Predictions = lazy(() => import('./pages/Predictions.jsx'));
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx'));
const Stats = lazy(() => import('./pages/Stats.jsx'));
const Live = lazy(() => import('./pages/Live.jsx'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess.jsx'));

// Admin pages
const AdminLogin = lazy(() => import('./admin/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard.jsx'));
const AdminUpload = lazy(() => import('./admin/AdminUpload.jsx'));
const AdminRaces = lazy(() => import('./admin/AdminRaces.jsx'));
const AdminDrivers = lazy(() => import('./admin/AdminDrivers.jsx'));
const AdminPredictions = lazy(() => import('./admin/AdminPredictions.jsx'));
const AdminBroadcast = lazy(() => import('./admin/AdminBroadcast.jsx'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/drivers" element={<PageTransition><Drivers /></PageTransition>} />
          <Route path="/drivers/:id" element={<PageTransition><DriverDetail /></PageTransition>} />
          <Route path="/constructors" element={<PageTransition><Constructors /></PageTransition>} />
          <Route path="/constructors/:id" element={<PageTransition><ConstructorDetail /></PageTransition>} />
          <Route path="/calendar" element={<PageTransition><Calendar /></PageTransition>} />
          <Route path="/predictions" element={<PageTransition><Predictions /></PageTransition>} />
          <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
          <Route path="/stats" element={<PageTransition><Stats /></PageTransition>} />
          <Route path="/live" element={<PageTransition><Live /></PageTransition>} />
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/upload" element={<ProtectedRoute><PageTransition><AdminUpload /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/races" element={<ProtectedRoute><PageTransition><AdminRaces /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/drivers" element={<ProtectedRoute><PageTransition><AdminDrivers /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/predictions" element={<ProtectedRoute><PageTransition><AdminPredictions /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/broadcast" element={<ProtectedRoute><PageTransition><AdminBroadcast /></PageTransition></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Navbar />
              <main>
                <AnimatedRoutes />
              </main>
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
