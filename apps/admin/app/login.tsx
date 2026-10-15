import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, colors, FormField, friendlyMessage, logoImage, PrimaryButton, spacing, validateRequired } from '@fg/shared';
import { useAuth } from '../src/auth';
import { supabaseConfigured } from '../src/supabase';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const passRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const next = { email: validateRequired(email, 'Email'), password: validateRequired(password, 'Kata sandi') };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;
    setBusy(true);
    try {
      await signIn(email, password);
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
        <AppText variant="label" color={colors.gold700}>Pusat kendali perjalanan</AppText>
        <AppText variant="display">Masuk Admin</AppText>
        <AppText variant="body" color={colors.inkMuted}>Kelola peserta, armada, jadwal, dan pantau lokasi rombongan.</AppText>
        {!supabaseConfigured ? (
          <AppText variant="bodyStrong" color={colors.danger}>Konfigurasi Supabase belum diisi (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).</AppText>
        ) : null}
        <View style={styles.form}>
          <FormField label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()} />
          <FormField ref={passRef} label="Kata sandi" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry autoCapitalize="none" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
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
