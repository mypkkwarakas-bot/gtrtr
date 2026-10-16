import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, elevation, HIT, radius, spacing } from '../theme/tokens';
import { IconName } from '../lib/status';
import { AppText } from './AppText';

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  style?: ViewStyle;
}

function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Tombol aksi utama: satu-satunya tempat gradient emerald + highlight tipis dipakai pada tombol. */
export function PrimaryButton({ label, onPress, icon, loading, disabled, danger, style }: ButtonProps) {
  const blocked = loading || disabled;
  const grad = danger ? [colors.danger, '#8E1D17'] : [colors.emerald600, colors.emerald800];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!blocked, busy: !!loading }}
      disabled={blocked}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.wrap, elevation.e2, { opacity: blocked ? 0.55 : pressed ? 0.92 : 1 }, style]}
    >
      <LinearGradient colors={grad as [string, string]} style={styles.fill}>
        <View style={styles.highlight} pointerEvents="none" />
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.row}>
            {icon ? <Ionicons name={icon} size={20} color={colors.white} /> : null}
            <AppText variant="h3" color={colors.white}>
              {label}
            </AppText>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon, loading, disabled, danger, style }: ButtonProps) {
  const blocked = loading || disabled;
  const fg = danger ? colors.danger : colors.emerald700;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!blocked, busy: !!loading }}
      disabled={blocked}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.secondary,
        { borderColor: danger ? colors.danger : colors.lineStrong, opacity: blocked ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
          <AppText variant="h3" color={fg}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color = colors.ink,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.icon, { backgroundColor: pressed ? colors.ivorySunken : 'transparent' }]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.button, minHeight: HIT + 4 },
  fill: { minHeight: HIT + 4, borderRadius: radius.button, paddingHorizontal: spacing.xl, justifyContent: 'center', overflow: 'hidden' },
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  secondary: {
    minHeight: HIT + 4,
    borderRadius: radius.button,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  icon: { width: HIT, height: HIT, borderRadius: HIT / 2, alignItems: 'center', justifyContent: 'center' },
});
