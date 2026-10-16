import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconName } from '../lib/status';
import { colors, elevation, HIT, radius, spacing } from '../theme/tokens';
import { AppText } from './AppText';

/** Baris menu bertarget sentuh besar: ikon, judul, keterangan, panah. */
export function MenuRow({ icon, title, subtitle, onPress }: { icon: IconName; title: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, elevation.e1, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.emerald700} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? <AppText variant="caption" color={colors.inkMuted}>{subtitle}</AppText> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: HIT + 16, padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  iconWrap: { width: 44, height: 44, borderRadius: radius.button, backgroundColor: colors.emerald50, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
