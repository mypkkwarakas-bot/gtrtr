import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';
import { AppText } from './AppText';

export function useIsOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOnline(s.isConnected !== false && s.isInternetReachable !== false));
    return unsub;
  }, []);
  return online;
}

/** Banner tipis saat koneksi terputus; tidak merender apa pun saat online. */
export function NetworkStatus() {
  const online = useIsOnline();
  if (online) return null;
  return (
    <View style={styles.bar} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
      <AppText variant="caption" color={colors.warning}>Koneksi terputus. Data yang tampil mungkin belum terbaru.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warningBg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
