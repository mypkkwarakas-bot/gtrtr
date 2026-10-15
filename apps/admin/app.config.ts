import { ExpoConfig } from 'expo/config';

// Variabel EXPO_PUBLIC_* di-inline saat bundle; lihat docs/EAS_BUILD.md.
const config: ExpoConfig = {
  name: 'Family Gathering Admin',
  slug: 'family-gathering-admin',
  scheme: 'fgadmin',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  newArchEnabled: true,
  splash: { image: './assets/splash-icon.png', resizeMode: 'contain', backgroundColor: '#FAF6EC' },
  android: {
    package: 'com.gathering.com.admin',
    versionCode: 1,
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#0A3328' },
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? '' } },
    permissions: ['android.permission.ACCESS_NETWORK_STATE'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
  ],
  experiments: { typedRoutes: false },
  extra: { eas: { projectId: process.env.EAS_PROJECT_ID } },
};

export default config;
