import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, colors, FormField, friendlyMessage, logoImage, PrimaryButton, spacing, validateRequired } from '@fg/shared';
import { Role, useAuth } from '../src/auth';
import { supabaseConfigured } from '../src/supabase';

const COPY: Record<Role, { eyebrow: string; title: string; desc: string }> = {
  admin: { eyebrow: 'Pusat kendali perjalanan', title: 'Masuk Admin', desc: 'Kelola peserta, armada, jadwal, dan pantau lokasi rombongan.' },
  kepala: { eyebrow: 'Tugas armada', title: 'Masuk Kepala Rombongan', desc: 'Masukkan PIN yang didaftarkan Admin.' },
};

export default function LoginScreen() {
  const { signInAdmin, signInKepala } = useAuth();
  const insets = useSafeAreaInsets();
  const secondRef = useRef<TextInput>(null);
  const [role, setRole] = useState<Role>('kepala');
  const [first, setFirst] = useState('');   // email (admin)
  const [second, setSecond] = useState(''); // kata sandi (admin) / PIN (kepala)
  const [errors, setErrors] = useState<{ first?: string; second?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isAdmin = role === 'admin';

  const switchRole = (r: Role) => {
    if (busy || r === role) return;
    setRole(r); setFirst(''); setSecond(''); setErrors({}); setFormError(null);
  };

  const submit = async () => {
    if (busy) return;
    const next = {
      first: isAdmin ? validateRequired(first, 'Email') : undefined,
      second: validateRequired(second, isAdmin ? 'Kata sandi' : 'PIN'),
    };
    setErrors(next);
    setFormError(null);
    if (next.first || next.second) return;
    setBusy(true);
    try {
      // Setelah sukses, app/index.tsx + guard di _layout mengarahkan sesuai peran dari server.
      if (isAdmin) await signInAdmin(first, second);
      else await signInKepala(second);
    } catch (e) {
      setFormError(friendlyMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const c = COPY[role];
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
        <Image source={logoImage} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo Family Gathering KLKM Jakarta Utara" />
        <View style={styles.tabs} accessibilityRole="tablist">
          {(['kepala', 'admin'] as Role[]).map((r) => (
            <Pressable key={r} accessibilityRole="tab" accessibilityState={{ selected: role === r }} onPress={() => switchRole(r)} style={[styles.tab, role === r && styles.tabOn]}>
              <AppText variant="bodyStrong" color={role === r ? colors.emerald700 : colors.inkMuted}>{r === 'admin' ? 'Admin' : 'Kepala Rombongan'}</AppText>
            </Pressable>
          ))}
        </View>
        <AppText variant="label" color={colors.gold700}>{c.eyebrow}</AppText>
        <AppText variant="display">{c.title}</AppText>
        <AppText variant="body" color={colors.inkMuted}>{c.desc}</AppText>
        {!supabaseConfigured ? (
          <AppText variant="bodyStrong" color={colors.danger}>Kunci Supabase belum diisi di src/config.ts.</AppText>
        ) : null}
        <View style={styles.form}>
          {isAdmin ? (
            <>
              <FormField key="email" label="Email" value={first} onChangeText={setFirst} error={errors.first} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" returnKeyType="next" onSubmitEditing={() => secondRef.current?.focus()} />
              <FormField key="pass" ref={secondRef} label="Kata sandi" value={second} onChangeText={setSecond} error={errors.second} secureTextEntry autoCapitalize="none" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
            </>
          ) : (
            <FormField key="pin" label="PIN" value={second} onChangeText={setSecond} error={errors.second} secureTextEntry keyboardType="number-pad" returnKeyType="go" onSubmitEditing={submit} />
          )}
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
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.line, marginBottom: spacing.md },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: colors.ivory },
});
