import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signInWithEmail: async () => ({}),
  handleEmailLinkSignIn: async () => ({}),
  signOut: async () => {},
  verifyOtp: async () => ({}),
  completeOnboarding: async () => ({})
});
