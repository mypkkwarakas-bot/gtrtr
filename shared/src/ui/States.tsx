import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';
import { IconName } from '../lib/status';
import { AppText } from './AppText';
import { PrimaryButton, SecondaryButton } from './Buttons';

export function LoadingState({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.emerald600} />
      <AppText variant="body" color={colors.inkMuted}>
        {label}
      </AppText>
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction }: { icon?: IconName; title: string; message?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.box}>
      <View style={styles.badge}>
        <Ionicons name={icon} size={32} color={colors.emerald700} />
      </View>
      <AppText variant="h2" style={styles.center}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color={colors.inkMuted} style={styles.center}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <SecondaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.box}>
      <View style={[styles.badge, { backgroundColor: colors.dangerBg }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
      </View>
      <AppText variant="h2" style={styles.center}>
        Data belum dapat dimuat
      </AppText>
      <AppText variant="body" color={colors.inkMuted} style={styles.center}>
        {message}
      </AppText>
      {onRetry ? <PrimaryButton label="Coba lagi" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: spacing.md, padding: spacing.xxxl },
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.emerald50, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
