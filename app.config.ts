import { ExpoConfig } from 'expo/config';

// Variabel EXPO_PUBLIC_* di-inline saat bundle; lihat docs/EAS_BUILD.md.
// Satu aplikasi untuk Admin dan Kepala Rombongan; peran ditentukan saat login.
const config: ExpoConfig = {
  name: 'Family Gathering',
  slug: 'wings545', // harus sama dengan slug project di expo.dev
  owner: 'wings445',
  scheme: 'fg',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  newArchEnabled: true,
  splash: { image: './assets/splash-icon.png', resizeMode: 'contain', backgroundColor: '#FAF6EC' },
  android: {
    package: 'com.gathering.com',
    versionCode: 1,
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#0A3328' },
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? '' } },
    permissions: ['android.permission.ACCESS_NETWORK_STATE', 'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_BACKGROUND_LOCATION', 'android.permission.FOREGROUND_SERVICE', 'android.permission.FOREGROUND_SERVICE_LOCATION', 'android.permission.POST_NOTIFICATIONS'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    ['expo-location', { isAndroidBackgroundLocationEnabled: true, isAndroidForegroundServiceEnabled: true, locationAlwaysAndWhenInUsePermission: 'Lokasi dipakai untuk membagikan posisi armada ke panitia selama perjalanan berlangsung.' }],
    'expo-task-manager',
  ],
  experiments: { typedRoutes: false },
  extra: { eas: { projectId: 'ece7d199-82cd-4b14-a46c-5e47cd4ed2b3' } },
};

export default config;
