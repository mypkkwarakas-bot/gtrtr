import { ExpoConfig } from 'expo/config';

// Variabel EXPO_PUBLIC_* di-inline saat bundle; lihat docs/EAS_BUILD.md.
const config: ExpoConfig = {
  name: 'Family Gathering Kepala Rombongan',
  slug: 'family-gathering-kepala',
  scheme: 'fgkepala',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  newArchEnabled: true,
  splash: { image: './assets/splash-icon.png', resizeMode: 'contain', backgroundColor: '#FAF6EC' },
  android: {
    package: 'com.gathering.com.kepala',
    versionCode: 1,
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#0A3328' },
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? '' } },
    permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_BACKGROUND_LOCATION', 'android.permission.FOREGROUND_SERVICE', 'android.permission.FOREGROUND_SERVICE_LOCATION', 'android.permission.POST_NOTIFICATIONS'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    ['expo-location', { isAndroidBackgroundLocationEnabled: true, isAndroidForegroundServiceEnabled: true, locationAlwaysAndWhenInUsePermission: 'Lokasi dipakai untuk membagikan posisi armada ke panitia selama perjalanan berlangsung.' }],
    'expo-task-manager',
  ],
  experiments: { typedRoutes: false },
  extra: { eas: { projectId: process.env.EAS_PROJECT_ID } },
};

export default config;
