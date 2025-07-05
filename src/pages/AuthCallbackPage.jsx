import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext/useAuth';
import { auth } from '../firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleEmailLinkSignIn } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const processSignIn = async () => {
      try {
        // Check if this is a sign-in with email link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          throw new Error('Invalid sign-in link');
        }

        // Get email
        let email = window.localStorage.getItem('emailForSignIn');
        // try query param first (was embedded by backend)
        const qpEmail = searchParams.get('email');
        if (!email && qpEmail) {
          email = qpEmail;
        }
        
        // If still no email and user already signed in, we can skip asking
        if (!email && auth.currentUser) {
          email = auth.currentUser.email;
        }

        if (!email) {
          // No email, redirect back to /auth with message
          throw new Error('Email address missing – please enter it again.');
        }

        // Complete the sign-in process
        const result = await handleEmailLinkSignIn(email, window.location.href);
        
        if (result.success) {
          setStatus('success');
          // Redirect based on whether it's a new user
          if (result.isNewUser) {
            navigate('/onboarding/name');
          } else {
            navigate('/dashboard');
          }
        } else {
          throw new Error(result.error || 'Failed to sign in');
        }
      } catch (error) {
        console.error('Error processing sign-in:', error);
        setStatus('error');
        setError(error.message || 'Failed to sign in. Please try again.');
      }
    };

    processSignIn();
  }, [navigate, handleEmailLinkSignIn, searchParams]);

  // Render loading state
  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying your sign-in link...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-red-600">
              Sign In Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default return (shouldn't reach here)
  return null;
};

export default AuthCallbackPage;
