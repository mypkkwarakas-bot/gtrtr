import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, tones } from '../theme/tokens';
import { StatusMeta } from '../lib/status';
import { AppText } from './AppText';

/** Status selalu ikon + label, tidak hanya warna. */
export function StatusChip({ meta }: { meta: StatusMeta }) {
  const t = tones[meta.tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]} accessibilityLabel={meta.label}>
      <Ionicons name={meta.icon} size={14} color={t.fg} />
      <AppText variant="caption" color={t.fg} style={styles.text}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.chip, alignSelf: 'flex-start' },
  text: { fontWeight: '700' },
});
