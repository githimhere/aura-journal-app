import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurajournal.app',
  appName: 'Aura Journal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '582081031989-fnt9v05btcv7e6fjcnsfi399e6plc1e8.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
