import { Stack } from 'expo-router';
import { colors } from '@fg/shared';

export default function KepalaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
