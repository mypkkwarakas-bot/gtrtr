import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, HIT, radius, spacing } from '../theme/tokens';
import { fontFamily } from '../theme/typography';
import { AppText } from './AppText';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField({ label, error, hint, style, ...rest }, ref) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={colors.inkSoft}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.inkFaint}
        {...rest}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? (
        <View style={styles.msg}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <AppText variant="caption" color={colors.danger}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" color={colors.inkMuted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

export function SearchField({ value, onChangeText, placeholder = 'Cari…' }: { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={20} color={colors.inkMuted} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        autoCorrect={false}
        style={styles.searchInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: { minHeight: HIT + 4, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, fontFamily: fontFamily.regular, fontSize: 16, color: colors.ink },
  inputError: { borderColor: colors.danger },
  msg: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: HIT, borderRadius: radius.input, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  searchInput: { flex: 1, fontFamily: fontFamily.regular, fontSize: 16, color: colors.ink, minHeight: HIT },
});
