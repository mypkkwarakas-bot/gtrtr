import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors, NetworkStatus, ToastProvider, useAppFonts } from '@fg/shared';
import { AuthProvider, useAuth } from '../src/auth';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000, refetchOnWindowFocus: false } } });

function Routes() {
  const { status } = useAuth();
  const fontsReady = useAppFonts();
  const ready = fontsReady && status !== 'loading';
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  if (!ready) return null;
  return (
    <>
      <NetworkStatus />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
        <Stack.Protected guard={status === 'admin'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="armada/[id]" />
          <Stack.Screen name="armada/form" />
          <Stack.Screen name="peserta/form" />
          <Stack.Screen name="jadwal/index" />
          <Stack.Screen name="jadwal/form" />
          <Stack.Screen name="pengumuman/index" />
          <Stack.Screen name="pengumuman/form" />
          <Stack.Screen name="destinasi" />
          <Stack.Screen name="pengaturan" />
        </Stack.Protected>
        <Stack.Protected guard={status !== 'admin'}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <Routes />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
