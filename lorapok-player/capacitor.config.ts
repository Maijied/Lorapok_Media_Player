import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lorapok.player',
  appName: 'Lorapok Player',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#050510',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#050510',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  android: {
    backgroundColor: '#050510',
    allowMixedContent: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
