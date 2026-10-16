import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BUS_ICON_KEYS, busImageFor, BusIconKey } from '../lib/fleetStyle';
import { colors, HIT, radius, spacing } from '../theme/tokens';
import { AppText } from './AppText';

/** Menampilkan ikon armada pilihan Admin; bila belum dipilih, ikon bus netral. */
export function FleetIcon({ iconKey, size = 56 }: { iconKey: string | null | undefined; size?: number }) {
  const src = busImageFor(iconKey);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {src ? (
        <Image source={src} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="Ikon armada" />
      ) : (
        <Ionicons name="bus-outline" size={size * 0.6} color={colors.inkFaint} accessibilityLabel="Ikon armada belum dipilih" />
      )}
    </View>
  );
}

/**
 * Pemilih ikon (khusus Admin). `usedBy` memetakan ikon -> nama armada lain yang memakainya;
 * pemakaian ganda tetap boleh tetapi diberi peringatan.
 */
export function FleetIconPicker({ value, onChange, usedBy = {}, disabled }: { value: string | null; onChange: (key: BusIconKey | null) => void; usedBy?: Partial<Record<string, string>>; disabled?: boolean }) {
  return (
    <View>
      <View style={styles.grid}>
        {BUS_ICON_KEYS.map((key) => {
          const selected = value === key;
          const other = usedBy[key];
          return (
            <Pressable
              key={key}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`Ikon ${key}${other ? `, dipakai ${other}` : ''}`}
              onPress={() => onChange(selected ? null : key)}
              style={[styles.cell, selected && styles.cellOn]}
            >
              <FleetIcon iconKey={key} size={64} />
              {selected ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </View>
              ) : null}
              {other && !selected ? (
                <AppText variant="caption" color={colors.warning} numberOfLines={1}>
                  {other}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {value && Object.entries(usedBy).some(([k]) => k === value) ? (
        <AppText variant="caption" color={colors.warning} style={{ marginTop: spacing.sm }}>
          Ikon ini juga dipakai armada lain. Boleh dilanjutkan.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '23%', minHeight: HIT + 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, padding: spacing.xs },
  cellOn: { borderColor: colors.emerald600, backgroundColor: colors.emerald50 },
  check: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.emerald600, alignItems: 'center', justifyContent: 'center' },
});
