import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Project-Clusterin',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: 'body', 
      resizeOnFullScreen: true
    }
  }
};

export default config;
