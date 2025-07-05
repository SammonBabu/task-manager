// @ts-ignore - Type definitions are available in @types/otp-generator
import otpGenerator from 'otp-generator';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getApps, getApp, initializeApp } from 'firebase-admin/app';

// Ensure Firebase app is initialized (utils may be imported before main index initializes)
const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const otpCollection = db.collection('otps');
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 60; // 60 seconds OTP validity

/**
 * Generate a new OTP for the given email
 * @param {string} email - User's email address
 * @returns {Promise<{otp: string, expiresAt: Date}>} Generated OTP and its expiry
 */
export async function generateOtp(email) {
  // Generate a 6-digit OTP
  const otp = otpGenerator.generate(OTP_LENGTH, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);

  // Save OTP to Firestore
  await otpCollection.add({
    email,
    otpCode: otp,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
    used: false,
  });

  return { otp, expiresAt };
}

/**
 * Verify if the provided OTP is valid for the given email
 * @param {string} email - User's email address
 * @param {string} otp - OTP to verify
 * @returns {Promise<{valid: boolean, message?: string}>} Verification result
 */
export async function verifyOtp(email, otp) {
  const now = new Date();

  // Validate OTP format
  if (!otp || !/^\d{6}$/.test(otp)) {
    return { valid: false, message: 'Invalid OTP format' };
  }

  // Find the most recent unused OTP for this email
  const snapshot = await otpCollection
      .where('email', '==', email)
      .where('otpCode', '==', otp)
      .where('used', '==', false)
      .where('expiresAt', '>', now)
      .orderBy('expiresAt', 'desc')
      .limit(1)
      .get();

  if (snapshot.empty) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }

  const otpDoc = snapshot.docs[0];

  // Mark OTP as used
  await otpDoc.ref.update({ used: true });

  return { valid: true };
}


