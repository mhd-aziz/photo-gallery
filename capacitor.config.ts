import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'photo-gallery',
  webDir: 'dist',
  plugins: {
    LiveUpdates: {
      appId: '6dfbcd46',
      channel: 'photo-gallery',
      autoUpdateMethod: 'background',
      maxVersions: 2
    }
  }
};

export default config;
