declare module './config' {
  interface Config {
    resend: {
      apiKey: string;
      from: string;
    };
    frontend: {
      url: string;
    };
  }
  
  const config: Config;
  export default config;
}
