import { Resend } from 'resend';
import config from '../config.js';

const resend = new Resend(config.resend.apiKey);

/**
 * Send OTP email to the user with magic link
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {Date} expiresAt - Expiration date
 * @param {string} magicLink - Magic link for authentication
 * @returns {Promise<{success: boolean, error?: string}>} Send result
 */
export async function sendOtpEmail(email, otp, expiresAt, magicLink) {
  try {
    console.log('Sending email via Resend', {
      from: config.resend.from,
      to: email,
    });
    if (!config.resend.apiKey) {
      console.error('Resend API key is not configured');
      return { success: false, error: 'Email service is not configured' };
    }

    const formattedOtp = (otp || '').match(/\d{1}/g)?.join(' ') || otp || '';

    const emailHtml = `
      <div style="
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 500px;
        margin: 0 auto;
        padding: 32px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        color: #37352f;
        line-height: 1.5;
      ">
        <div style="margin-bottom: 24px;">
          <h1 style="
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #37352f;
          ">
            Your Login Code
          </h1>
          <p style="margin: 0; color: #787774;">
            Use this code to sign in to your account:
          </p>
        </div>
        
        <div style="
          background: #f7f6f3;
          padding: 20px;
          text-align: center;
          margin: 24px 0 32px;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 8px;
          color: #37352f;
          border-radius: 6px;
          border: 1px solid #e9e9e9;
        ">
          ${formattedOtp}
        </div>
        
        <div style="
          background: #f7f6f3;
          padding: 16px;
          border-radius: 6px;
          font-size: 14px;
          color: #787774;
          margin-bottom: 24px;
        ">
          <p style="margin: 0 0 8px 0; font-weight: 500;">This code expires in 1 minute.</p>
          <p style="margin: 0;">For security reasons, please do not share this code with anyone.</p>
        </div>
        
        <div style="margin-top: 24px; text-align: center;">
          <p style="margin-bottom: 12px; color: #787774;">
            Or use this magic link to sign in:
          </p>
          <a 
            href="${magicLink}" 
            style="
              display: inline-block;
              padding: 8px 16px;
              background: #37352f;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign In Instantly
          </a>
        </div>
        
        <div style="
          border-top: 1px solid #e9e9e9;
          padding-top: 24px;
          font-size: 13px;
          color: #9b9a97;
        ">
          <p style="margin: 0 0 8px 0;">If you didn't request this code, you can safely ignore this email.</p>
          <p style="margin: 0;">This email was sent to ${email}.</p>
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: config.resend.from,
      to: email,
      subject: `Your OTP: ${otp}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: 'Failed to send email',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception sending OTP email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send magic link email to the user
 * @param {string} email - Recipient email
 * @param {string} magicLink - Magic link URL
 * @returns {Promise<{success: boolean, error?: string}>} Send result
 */
export async function sendMagicLinkEmail(email, magicLink) {
  try {
    const { error } = await resend.emails.send({
      from: config.resend.from,
      to: email,
      subject: 'Your Magic Link',
      html: `
        <div style="
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 500px;
          margin: 0 auto;
          padding: 32px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          color: #37352f;
          line-height: 1.5;
        ">
          <div style="margin-bottom: 24px;">
            <h1 style="
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 16px 0;
              color: #37352f;
            ">
              Your Magic Link is Here
            </h1>
            <p style="margin: 0; color: #787774;">
              Click the button below to sign in to your account. 
              This link will expire in 15 minutes.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLink}"
               style="
                 display: inline-block;
                 padding: 12px 24px;
                 background: #37352f;
                 color: white;
                 text-decoration: none;
                 border-radius: 5px;
                 font-weight: 500;
                 font-size: 15px;
                 transition: background-color 0.2s;
               "
               onmouseover="this.style.backgroundColor='#2b2a27'"
               onmouseout="this.style.backgroundColor='#37352f'"
               target="_blank">
              Sign In to Your Account
            </a>
          </div>
          
          <div style="
            background: #f7f6f3;
            padding: 16px;
            border-radius: 6px;
            margin: 32px 0;
            font-size: 14px;
            color: #787774;
          ">
            <p style="margin: 0 0 8px 0; font-weight: 500;">Or copy and paste this link:</p>
            <div style="
              background: #ffffff;
              padding: 10px 12px;
              border-radius: 4px;
              border: 1px solid #e9e9e9;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 13px;
              word-break: break-all;
              color: #37352f;
              overflow-wrap: break-word;
            ">
              ${magicLink}
            </div>
          </div>
          
          <div style="
            border-top: 1px solid #e9e9e9;
            padding-top: 24px;
            font-size: 13px;
            color: #9b9a97;
          ">
            <p style="margin: 0 0 8px 0;">If you didn't request this link, you can safely ignore this email.</p>
            <p style="margin: 0;">This email was sent to ${email}.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending magic link email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception sending magic link email:', error);
    return { success: false, error: error.message };
  }
}
