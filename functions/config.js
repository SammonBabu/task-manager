/* eslint-env node */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration
 * @type {Object}
 * @property {Object} resend - Resend.com email service configuration
 * @property {string} resend.apiKey - API key for Resend.com
 * @property {string} resend.from - Sender email address
 * @property {string} frontendUrl - Base URL for the frontend application
 * @property {Object} otp - OTP configuration
 * @property {number} otp.length - Length of OTP code (default: 6)
 * @property {number} otp.expiryMinutes - OTP expiration time in minutes (default: 5)
 */
const config = {
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'onboarding@resend.dev',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  otp: {
    length: Number.isInteger(Number(process.env.OTP_LENGTH)) ?
      Number(process.env.OTP_LENGTH) :
      6,
    expiryMinutes: Number.isInteger(Number(process.env.OTP_EXPIRY_MINUTES)) ?
      Number(process.env.OTP_EXPIRY_MINUTES) :
      5,
  },
};

// Validate required configurations
if (!config.resend.apiKey) {
  console.warn('WARNING: RESEND_API_KEY is not set. Email sending will fail.');
}

export default config;
