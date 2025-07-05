import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context';
import { auth } from '../../firebase';
import { 
  signInWithCustomToken,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { requestOtp, loginWithOtp, updateProfile, fetchProfile } from '../../services/authService';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const token = await firebaseUser.getIdTokenResult();

        // try to get onboarding status from backend
        let onboarded = false;
        try {
          const profileRes = await fetchProfile();
          onboarded = profileRes?.profile?.onboarded || profileRes?.onboarded || false;
        } catch (_) {
          // ignore
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          isNewUser: !onboarded,
          onboarded,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Request OTP + magic link via Cloud Function
  const signInWithEmail = useCallback(async (email) => {
    return requestOtp(email);
  }, []);

  // Login with OTP via Cloud Function
  const handleOtpLogin = useCallback(async (email, otp) => {
    return loginWithOtp(email, otp);
  }, []);

  // Handle Firebase magic link sign-in (fallback)
  const handleEmailLinkSignIn = useCallback(async (email, emailLink) => {
    try {
      const emailToUse = email || window.localStorage.getItem('emailForSignIn');
      if (!emailToUse) throw new Error('Email required');
      const result = await signInWithEmailLink(auth, emailToUse, emailLink);
      window.localStorage.removeItem('emailForSignIn');

      // after sign in, check onboarding status from backend
      let onboarded = false;
      try {
        const profileRes = await fetchProfile();
        onboarded = profileRes?.profile?.onboarded || profileRes?.onboarded || false;
      } catch (_) {
        // ignore fetch errors
      }

      return {
        success: true,
        isNewUser: !onboarded,
      };
    } catch (err) {
      console.error('handleEmailLinkSignIn error', err);
      return { success: false, error: err.message || 'Sign-in failed' };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign out. Please try again.' 
      };
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = async (userData) => {
    try {
      // TODO: Save user data to Firestore
      console.log('Completing onboarding with:', userData);
      setUser(prevUser => ({ 
        ...prevUser, 
        ...userData, 
        isNewUser: false 
      }));
      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to complete onboarding. Please try again.' 
      };
    }
  };

  const verifyOtp = async (email, otp) => handleOtpLogin(email, otp);

  const value = {
    user,
    loading,
    error,
    signInWithEmail,
    verifyOtp,
    handleEmailLinkSignIn,
    completeOnboarding,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
