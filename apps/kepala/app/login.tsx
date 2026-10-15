import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, colors, FormField, friendlyMessage, logoImage, PrimaryButton, spacing, validateRequired } from '@fg/shared';
import { useAuth } from '../src/auth';
import { supabaseConfigured } from '../src/supabase';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const pinRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<{ code?: string; pin?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const next = { code: validateRequired(code, 'Kode peserta'), pin: validateRequired(pin, 'PIN') };
    setErrors(next);
    setFormError(null);
    if (next.code || next.pin) return;
    setBusy(true);
    try {
      await signIn(code, pin);
    } catch (e) {
      setFormError(friendlyMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
        <Image source={logoImage} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo Family Gathering KLKM Jakarta Utara" />
        <AppText variant="label" color={colors.gold700}>Tugas armada</AppText>
        <AppText variant="display">Masuk Kepala Rombongan</AppText>
        <AppText variant="body" color={colors.inkMuted}>Gunakan kode peserta dan PIN yang diberikan panitia.</AppText>
        {!supabaseConfigured ? (
          <AppText variant="bodyStrong" color={colors.danger}>Konfigurasi Supabase belum diisi (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).</AppText>
        ) : null}
        <View style={styles.form}>
          <FormField label="Kode peserta" value={code} onChangeText={setCode} error={errors.code} autoCapitalize="characters" autoCorrect={false} returnKeyType="next" onSubmitEditing={() => pinRef.current?.focus()} />
          <FormField ref={pinRef} label="PIN" value={pin} onChangeText={setPin} error={errors.pin} secureTextEntry keyboardType="number-pad" maxLength={12} returnKeyType="go" onSubmitEditing={submit} />
          {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
          <PrimaryButton label="Masuk" icon="log-in-outline" onPress={submit} loading={busy} disabled={!supabaseConfigured} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xxl, gap: spacing.md },
  logo: { width: 120, height: 120, alignSelf: 'flex-start', marginBottom: spacing.sm },
  form: { gap: spacing.lg, marginTop: spacing.xl },
});
