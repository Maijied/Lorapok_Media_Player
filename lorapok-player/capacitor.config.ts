import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lorapok.player',
  appName: 'Lorapok Player',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#00000000',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#00000000',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  android: {
    backgroundColor: '#00000000',
    allowMixedContent: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
