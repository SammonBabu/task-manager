declare const config: {
  resend: {
    apiKey: string;
    from: string;
  };
  frontend: {
    url: string;
  };
  otp: {
    length: number;
    expiryMinutes: number;
  };
};

export default config;
