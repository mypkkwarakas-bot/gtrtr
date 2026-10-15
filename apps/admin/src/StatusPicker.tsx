import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, colors, HIT, PublishStatus, radius, spacing } from '@fg/shared';

const OPTIONS: { value: PublishStatus; label: string }[] = [
  { value: 'draft', label: 'Draf' },
  { value: 'published', label: 'Terpublikasi' },
  { value: 'archived', label: 'Diarsipkan' },
];

/** Pilihan status draf / terpublikasi / diarsipkan (semua tabel konten memakai tiga nilai ini). */
export function StatusPicker({ value, onChange, hint }: { value: PublishStatus; onChange: (v: PublishStatus) => void; hint?: string }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" color={colors.inkSoft}>Status</AppText>
      <View style={styles.row} accessibilityRole="radiogroup">
        {OPTIONS.map((o) => {
          const on = value === o.value;
          return (
            <Pressable key={o.value} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[styles.opt, on && styles.optOn]}>
              <AppText variant="bodyStrong" color={on ? colors.emerald700 : colors.inkMuted}>{o.label}</AppText>
            </Pressable>
          );
        })}
      </View>
      {hint ? <AppText variant="caption" color={colors.inkMuted}>{hint}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  opt: { flex: 1, minHeight: HIT, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: spacing.sm },
  optOn: { borderColor: colors.emerald700, backgroundColor: colors.emerald50 },
});
