import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, app } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

const functions = getFunctions(app);

/**
 * Call Cloud Function to send OTP & magic link email
 * @param {string} email
 * @returns {Promise<{success:boolean,message?:string,error?:string}>}
 */
export async function requestOtp(email) {
  try {
    const sendOtp = httpsCallable(functions, 'sendOtpAndMagicLink');
    const res = await sendOtp({ email });
    return { success: true, ...res.data };
  } catch (err) {
    console.error('requestOtp error', err);
    return { success: false, error: err.message || 'Server error' };
  }
}

/**
 * Verify OTP, sign user in with custom token
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{success:boolean,isNewUser?:boolean,error?:string}>}
 */
export async function loginWithOtp(email, otp) {
  try {
    const verifyOtp = httpsCallable(functions, 'verifyOtpAndLogin');
    const res = await verifyOtp({ email, otp });
    const { token, isNewUser, onboarded } = res.data;
    await signInWithCustomToken(auth, token);
    // ensure onAuthStateChanged has fired
    await new Promise((resolve) => {
      if (auth.currentUser) return resolve();
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          unsub();
          resolve();
        }
      });
    });
    return { success: true, isNewUser, onboarded };
  } catch (err) {
    console.error('loginWithOtp error', err);
    return { success: false, error: err.message || 'Server error' };
  }
}

/**
 * Update user profile (onboarding)
 * @param {{name?:string,workspaceName?:string}} data
 */
export async function updateProfile(data) {
  try {
    const fn = httpsCallable(functions, 'updateUserProfile');
    const res = await fn(data);
    return { success: true, ...res.data };
  } catch (err) {
    console.error('updateProfile error', err);
    return { success: false, error: err.message || 'Server error' };
  }
}

export async function fetchProfile() {
  try {
    const fn = httpsCallable(functions, 'getUserProfile');
    const res = await fn();
    return { success: true, ...res.data };
  } catch (err) {
    console.error('fetchProfile error', err);
    return { success: false, error: err.message || 'Server error' };
  }
}
