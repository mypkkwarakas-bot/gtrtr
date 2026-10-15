import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, elevation, radius, spacing } from '../theme/tokens';
import { AppText } from './AppText';

/** Kartu standar: datar, garis tipis, tanpa gradient. */
export function PremiumCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, elevation.e1, style]}>{children}</View>;
}

/** Panel hero: satu-satunya permukaan glossy (gradient emerald + highlight) di layar. */
export function HeroCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient colors={[colors.emerald700, colors.emerald900]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, elevation.e3, style]}>
      <LinearGradient colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']} style={styles.gloss} pointerEvents="none" />
      {children}
    </LinearGradient>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <PremiumCard style={styles.stat}>
      <AppText variant="label" color={colors.inkMuted}>
        {label}
      </AppText>
      <AppText variant="stat">{value}</AppText>
      {hint ? (
        <AppText variant="caption" color={colors.inkMuted}>
          {hint}
        </AppText>
      ) : null}
    </PremiumCard>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="h2">{title}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: spacing.lg },
  hero: { borderRadius: radius.hero, padding: spacing.xl, overflow: 'hidden' },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  stat: { flex: 1, gap: spacing.xs },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
});
