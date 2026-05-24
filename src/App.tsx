import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import TrainerOnboardingPage from './pages/TrainerOnboardingPage';
import SearchPage from './pages/SearchPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingCancelPage from './pages/BookingCancelPage';
import TrainerProfilePage from './pages/TrainerProfilePage';
import ClientProfilePage from './pages/ClientProfilePage';
import ReviewPage from './pages/ReviewPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import PageTransition from './components/ui/PageTransition';
import { useAuthContext } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRestoring } = useAuthContext();
  const location = useLocation();
  if (isRestoring) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" state={{ from: location }} replace />;
}

function ClientOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  if (user?.role === 1) return <Navigate to="/trainer" replace />;
  if (user?.role === 2) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function TrainerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  if (user?.role === 0) return <Navigate to="/search" replace />;
  if (user?.role === 2) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  if (user?.role === 0) return <Navigate to="/search" replace />;
  if (user?.role === 1) return <Navigate to="/trainer" replace />;
  return <>{children}</>;
}

function DefaultRedirect() {
  const { user, isRestoring } = useAuthContext();
  if (isRestoring) return null;
  const path = user?.role === 1 ? '/trainer' : user?.role === 2 ? '/admin' : '/search';
  return <Navigate to={path} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route path="/search" element={<ClientOnlyRoute><PageTransition><SearchPage /></PageTransition></ClientOnlyRoute>} />
        <Route path="/trainer/:id" element={<ClientOnlyRoute><PageTransition><TrainerProfilePage /></PageTransition></ClientOnlyRoute>} />
        <Route path="/onboarding" element={<PrivateRoute><PageTransition><OnboardingPage /></PageTransition></PrivateRoute>} />
        <Route path="/trainer-onboarding" element={<PrivateRoute><PageTransition><TrainerOnboardingPage /></PageTransition></PrivateRoute>} />
        <Route path="/booking/confirm" element={<PrivateRoute><PageTransition><BookingConfirmPage /></PageTransition></PrivateRoute>} />
        <Route path="/booking/success" element={<PrivateRoute><PageTransition><BookingSuccessPage /></PageTransition></PrivateRoute>} />
        <Route path="/booking/cancel" element={<PrivateRoute><PageTransition><BookingCancelPage /></PageTransition></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><ClientOnlyRoute><PageTransition><ClientProfilePage /></PageTransition></ClientOnlyRoute></PrivateRoute>} />
        <Route path="/trainer" element={<PrivateRoute><TrainerOnlyRoute><PageTransition><TrainerDashboardPage /></PageTransition></TrainerOnlyRoute></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminOnlyRoute><PageTransition><AdminPanelPage /></PageTransition></AdminOnlyRoute></PrivateRoute>} />
        <Route path="/review" element={<PrivateRoute><PageTransition><ReviewPage /></PageTransition></PrivateRoute>} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
