import { Stack } from 'expo-router';
import { colors } from '@fg/shared';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
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
    </Stack>
  );
}
