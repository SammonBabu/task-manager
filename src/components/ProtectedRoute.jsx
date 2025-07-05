import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireOnboardingComplete = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user not in context yet but Firebase has one, wait
  if (!user && auth.currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If after that still no user, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If onboarding is required but not completed, redirect to onboarding
  if (requireOnboardingComplete && user.isNewUser) {
    return <Navigate to="/onboarding/name" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
