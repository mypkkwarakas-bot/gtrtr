import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './Buttons';

export function AppHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      {onBack ? <IconButton icon="arrow-back" label="Kembali" onPress={onBack} /> : null}
      <View style={styles.titles}>
        <AppText variant="title" numberOfLines={1}>{title}</AppText>
        {subtitle ? <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.ivory },
  titles: { flex: 1 },
});
