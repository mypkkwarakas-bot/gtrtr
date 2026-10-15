import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '@fg/shared';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald700,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fontFamily.semibold, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="peserta" options={{ title: 'Peserta', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="armada" options={{ title: 'Armada', tabBarIcon: ({ color, size }) => <Ionicons name="bus-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="peta" options={{ title: 'Peta', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="kelola" options={{ title: 'Kelola', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
