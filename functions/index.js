// @ts-check

import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';

import { generateOtp, verifyOtp } from './utils/otp.js';
import { sendOtpEmail } from './utils/email.js';
import config from './config.js';

// Import type declarations



/** @typedef {import('firebase-functions/v2/https').CallableRequest} CallableRequest */

/**
 * @typedef {Object} UserData
 * @property {string} [fullName]
 * @property {string} [workspaceName]
 * @property {boolean} [onboarded]
 * @property {string} [email]
 */

// Constants
const MAX_ATTEMPTS = 5; // Maximum number of OTP attempts
const ATTEMPT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes window for rate limiting

// Initialize Firebase Admin (ensure single default app)
const app = getApps().length ? getApp() : initializeApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Set global options for all functions
setGlobalOptions({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 120,
  maxInstances: 10,
});

/**
 * Send OTP and Magic Link to user's email
 */
/** @type {Map<string, {count: number, timestamp: number}>} */
const otpAttempts = new Map();

// Reset attempt counter after window expires
setInterval(() => {
  const now = Date.now();
  for (const [email, { timestamp }] of otpAttempts.entries()) {
    if (now - timestamp > ATTEMPT_WINDOW_MS) {
      otpAttempts.delete(email);
    }
  }
}, 5 * 60 * 1000).unref(); // Cleanup every 5 minutes, unref to prevent keeping process alive

/**
 * Sends an OTP and magic link to the user's email
 * @param {CallableRequest} request - The callable request
 * @returns {Promise<{success: boolean, message: string, expiresAt: number}>} The result of the operation
 */
export const sendOtpAndMagicLink = onCall(async (request) => {
  try {
    // Type assertion for request.data
    /** @type {{email: string}} */
    const data = request.data;
    const { email } = data;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError(
          'invalid-argument',
          'Please provide a valid email address.',
      );
    }

    // Check rate limiting
    const now = Date.now();
    const attemptInfo = otpAttempts.get(email) || { count: 0, timestamp: now };

    if (attemptInfo.count >= MAX_ATTEMPTS) {
      throw new HttpsError(
          'resource-exhausted',
          'Too many attempts. Please try again later.',
      );
    }

    // Update attempt counter
    otpAttempts.set(email, {
      count: attemptInfo.count + 1,
      timestamp: now,
    });

    // Generate OTP (expiry is handled in the generateOtp function)
    const { otp, expiresAt } = await generateOtp(email);

    // Generate magic link
    const actionCodeSettings = {
      url: `${config.frontend.url}/auth/callback?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    const magicLink = await auth
        .generateSignInWithEmailLink(email, actionCodeSettings);

    // Send email with OTP and magic link
    const emailResult = await sendOtpEmail(email, otp, new Date(expiresAt), magicLink);

    if (!emailResult.success) {
      throw new HttpsError(
          'internal',
          'Failed to send email. Please try again.',
      );
    }

    return {
      success: true,
      message: 'OTP sent to your email',
      expiresAt: expiresAt.getTime(), // Return timestamp in milliseconds
    };
  } catch (/** @type {any} */ error) {
    const errorMessage = error?.message || 'An error occurred while processing your request.';
    console.error('Error in sendOtpAndMagicLink:', errorMessage);
    if (error?.stack) {
      console.error(error.stack);
    }
    throw new HttpsError('internal', 'An error occurred while processing your request.');
  }
});

/**
 * Verify OTP and sign in or create user
 */
/**
 * Verifies the OTP and logs in the user
 * @param {CallableRequest & {data: {email: string, otp: string}}} request - The callable request with email and OTP
 * @returns {Promise<{
 *   success: boolean,
 *   token: string,
 *   isNewUser: boolean,
 *   onboarded: boolean,
 *   fullName?: string,
 *   workspaceName?: string,
 *   email: string
 * }>} The authentication result
 */
export const verifyOtpAndLogin = onCall(async (request) => {
  try {
    const { email, otp } = request.data;

    // Validate input
    if (!email || !otp) {
      throw new HttpsError(
          'invalid-argument',
          'Email and OTP are required.',
      );
    }

    // Check rate limiting
    const attemptInfo = otpAttempts.get(email) || { count: 0, timestamp: Date.now() };
    if (attemptInfo.count >= MAX_ATTEMPTS) {
      throw new HttpsError(
          'resource-exhausted',
          'Too many attempts. Please request a new OTP.',
      );
    }

    // Verify OTP
    const otpVerification = await verifyOtp(email, otp);
    if (!otpVerification.valid) {
      // Increment failed attempt counter
      const attemptInfo = otpAttempts.get(email) || { count: 0, timestamp: Date.now() };
      otpAttempts.set(email, {
        count: attemptInfo.count + 1,
        timestamp: attemptInfo.timestamp,
      });

      throw new HttpsError(
          'permission-denied',
          otpVerification.message || 'Invalid OTP. ' +
          `You have ${Math.max(0, MAX_ATTEMPTS - attemptInfo.count - 1)} attempts remaining.`,
      );
    }

    // Reset attempt counter on successful verification
    otpAttempts.delete(email);

    let userRecord;
    let isNewUser = false;

    try {
      // Check if user exists
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user if doesn't exist
        userRecord = await auth.createUser({
          email,
          emailVerified: true,
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email,
          onboarded: false,
          createdAt: FieldValue.serverTimestamp(),
          lastLoginAt: FieldValue.serverTimestamp(),
        });

        isNewUser = true;
      } else {
        throw error;
      }
    }

    // Update last login time
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set(
        { lastLoginAt: FieldValue.serverTimestamp() },
        { merge: true },
      );

    // Update attempt counter
    await db
      .collection('otpAttempts')
      .doc(email)
      .set({
        count: 0,
        lastAttempt: FieldValue.serverTimestamp(),
      });

    // Check if user has completed onboarding
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    // Generate custom token for client-side sign-in
    const token = await auth.createCustomToken(userRecord.uid, {
      onboarded: userData?.onboarded || false,
    });

    return {
      token,
      isNewUser,
      onboarded: userData?.onboarded || false,
      email: userRecord.email,
    };
  } catch (/** @type {any} */ error) {
    if (error instanceof HttpsError) {
      // Re-throw expected errors so client gets correct code/message
      throw error;
    }
    const errorMessage = error?.message || 'An unexpected error occurred during login.';
    console.error('Error in verifyOtpAndLogin:', errorMessage);
    if (error?.stack) {
      console.error(error.stack);
    }
    throw new HttpsError('internal', 'An unexpected error occurred during login. Please try again.');
  }
});

/**
 * Update user profile (for onboarding)
 */
/**
 * Updates the user's profile information
 * @param {CallableRequest & {data: {fullName: string, workspaceName: string}}} request 
 * @returns {Promise<{success: boolean, message: string}>} The result of the operation
 */
export const updateUserProfile = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError(
          'unauthenticated',
          'You must be logged in to update your profile.',
      );
    }

    const { fullName, workspaceName } = request.data;
    const userId = request.auth.uid;

    // Validate input
    if (!fullName || !workspaceName) {
      throw new HttpsError(
          'invalid-argument',
          'Full name and workspace name are required.'
      );
    }

    // Update user document
    await db
      .collection('users')
      .doc(userId)
      .set(
        {
          fullName,
          workspaceName,
          onboarded: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    return { success: true, message: 'Profile updated successfully' };
  } catch (/** @type {any} */ error) {
    console.error('Error in updateUserProfile:', error);
    const errorMessage = error?.message || 'Failed to update profile';
    throw new HttpsError('internal', errorMessage);
  }
});

/**
 * Get user profile
 */
export const getUserProfile = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError(
          'unauthenticated',
          'You must be logged in to view your profile.',
      );
    }

    const userId = request.auth.uid;

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError(
          'not-found',
          'User profile not found.',
      );
    }

    return {
      success: true,
      profile: userDoc.data(),
    };
  } catch (/** @type {any} */ error) {
    console.error('Error in getUserProfile:', error);
    const errorMessage = error?.message || 'Failed to fetch profile';
    throw new HttpsError('internal', errorMessage);
  }
});
