interface OTPAttempt {
  count: number;
  timestamp: number;
}

declare const otpAttempts: Map<string, OTPAttempt>;

export {};
