import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext/TaskContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import Dashboard from './pages/Dashboard';
import NameStep from './pages/onboarding/NameStep';
import WorkspaceStep from './pages/onboarding/WorkspaceStep';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Onboarding routes - only accessible for new users */}
        <Route 
          path="/onboarding/name" 
          element={
            <ProtectedRoute requireOnboardingComplete={false}>
              <NameStep />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding/workspace" 
          element={
            <ProtectedRoute requireOnboardingComplete={false}>
              <WorkspaceStep />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
          </TaskProvider>
    </AuthProvider>
  );
}

export default App;
