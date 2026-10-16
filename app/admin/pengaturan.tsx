import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppHeader, AppText, colors, ConfirmationSheet, ErrorState, formatClockInput, FormField, friendlyMessage, LoadingState, PremiumCard, PrimaryButton,
  SecondaryButton, SectionHeader, spacing, useToast, validateDateInput, validateMaxLength, validatePositiveInt, validateTimeInput,
} from '@fg/shared';
import { EVENT_KEY, fetchEvent, updateEventInfo } from '../../src/admin/content';
import { useAuth } from '../../src/auth';

export default function PengaturanScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const toast = useToast();
  const { email, signOut } = useAuth();
  const q = useQuery({ queryKey: EVENT_KEY, queryFn: fetchEvent });
  const e = q.data;

  const [f, setF] = useState({ name: '', description: '', date: '', time: '', contact: '', general: '', late: '60', stale: '300', ttl: '120' });
  const [showMap, setShowMap] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<(() => void) | null>(null);
  const loaded = useRef(false);
  const saved = useRef(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const fromEvent = (ev: NonNullable<typeof e>) => ({
    name: ev.event_name ?? '', description: ev.description ?? '', date: ev.event_date ?? '', time: formatClockInput(ev.start_time),
    contact: ev.contact_info ?? '', general: ev.general_info ?? '', late: String(ev.late_after_seconds), stale: String(ev.stale_after_seconds), ttl: String(ev.location_request_ttl_seconds),
  });
  useEffect(() => {
    if (e && !loaded.current) {
      loaded.current = true;
      setF(fromEvent(e));
      setShowMap(e.show_map_to_participants);
    }
  }, [e]);

  const dirty = !!e && (JSON.stringify(f) !== JSON.stringify(fromEvent(e)) || showMap !== e.show_map_to_participants);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  useEffect(() => navigation.addListener('beforeRemove', (ev) => {
    if (!dirtyRef.current || saved.current) return;
    ev.preventDefault();
    setConfirmLeave(() => () => navigation.dispatch(ev.data.action));
  }), [navigation]);

  const save = useMutation({
    mutationFn: updateEventInfo,
    onSuccess: async () => {
      saved.current = true;
      await qc.invalidateQueries({ queryKey: EVENT_KEY });
      toast('success', 'Pengaturan disimpan.');
      router.back();
    },
    onError: (err) => setFormError(friendlyMessage(err)),
  });

  const submit = () => {
    if (save.isPending) return;
    const next: Record<string, string | undefined> = {
      name: validateMaxLength(f.name, 120, 'Nama kegiatan'),
      date: validateDateInput(f.date, 'Tanggal', false),
      time: validateTimeInput(f.time, 'Jam mulai', false),
      late: validatePositiveInt(f.late, 'Batas tertunda'),
      stale: validatePositiveInt(f.stale, 'Batas lokasi lama'),
      ttl: validatePositiveInt(f.ttl, 'Masa berlaku permintaan lokasi'),
    };
    if (!next.late && !next.stale && parseInt(f.stale, 10) <= parseInt(f.late, 10)) next.stale = 'Batas lokasi lama harus lebih besar dari batas tertunda';
    if (f.time.trim() && !f.date.trim()) next.date = 'Isi tanggal bila jam mulai diisi';
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;
    save.mutate({
      event_name: f.name, description: f.description, event_date: f.date, start_time: f.time, contact_info: f.contact, general_info: f.general,
      show_map_to_participants: showMap, late_after_seconds: parseInt(f.late, 10), stale_after_seconds: parseInt(f.stale, 10), location_request_ttl_seconds: parseInt(f.ttl, 10),
    });
  };

  const doSignOut = async () => {
    setSigningOut(true);
    try { await signOut(); } finally { setSigningOut(false); setConfirmOut(false); }
  };

  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} />;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Pengaturan" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <SectionHeader title="Informasi kegiatan" />
        <FormField label="Nama kegiatan" value={f.name} onChangeText={set('name')} error={errors.name} maxLength={120} />
        <FormField label="Deskripsi singkat" value={f.description} onChangeText={set('description')} multiline style={{ minHeight: 72, textAlignVertical: 'top' }} />
        <View style={styles.pair}>
          <View style={{ flex: 1.3 }}><FormField label="Tanggal (WIB)" value={f.date} onChangeText={set('date')} error={errors.date} placeholder="2026-11-15" keyboardType="numbers-and-punctuation" maxLength={10} /></View>
          <View style={{ flex: 1 }}><FormField label="Jam mulai" value={f.time} onChangeText={set('time')} error={errors.time} placeholder="07:00" keyboardType="numbers-and-punctuation" maxLength={5} /></View>
        </View>
        <FormField label="Kontak panitia" value={f.contact} onChangeText={set('contact')} />
        <FormField label="Informasi umum" value={f.general} onChangeText={set('general')} multiline style={{ minHeight: 96, textAlignVertical: 'top' }} />

        <SectionHeader title="Peta dan status lokasi" />
        <PremiumCard>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">Tampilkan peta ke Peserta</AppText>
              <AppText variant="caption" color={colors.inkMuted}>Bila mati, hanya Admin dan Kepala Rombongan yang melihat posisi armada.</AppText>
            </View>
            <Switch value={showMap} onValueChange={setShowMap} accessibilityLabel="Tampilkan peta ke Peserta" trackColor={{ true: colors.emerald500, false: colors.line }} thumbColor={colors.surface} />
          </View>
        </PremiumCard>
        <FormField label="Batas lokasi tertunda (detik)" value={f.late} onChangeText={set('late')} error={errors.late} keyboardType="number-pad" hint="Lewat batas ini status menjadi Lokasi tertunda." />
        <FormField label="Batas lokasi lama (detik)" value={f.stale} onChangeText={set('stale')} error={errors.stale} keyboardType="number-pad" hint="Lewat batas ini status menjadi Lokasi lama." />
        <FormField label="Masa berlaku permintaan lokasi (detik)" value={f.ttl} onChangeText={set('ttl')} error={errors.ttl} keyboardType="number-pad" />

        {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
        <PrimaryButton label="Simpan pengaturan" icon="checkmark" onPress={submit} loading={save.isPending} />

        <SectionHeader title="Akun" />
        <PremiumCard>
          <AppText variant="body" color={colors.inkMuted}>Masuk sebagai</AppText>
          <AppText variant="bodyStrong">{email ?? '-'}</AppText>
        </PremiumCard>
        <SecondaryButton label="Keluar" icon="log-out-outline" danger onPress={() => setConfirmOut(true)} />
      </ScrollView>
      <ConfirmationSheet visible={confirmOut} title="Keluar dari akun Admin?" message="Anda perlu email dan kata sandi untuk masuk kembali." confirmLabel="Keluar" danger loading={signingOut} onCancel={() => setConfirmOut(false)} onConfirm={() => void doSignOut()} />
      <ConfirmationSheet visible={confirmLeave !== null} title="Buang perubahan?" message="Perubahan yang belum disimpan akan hilang." confirmLabel="Buang" cancelLabel="Lanjut mengisi" danger onCancel={() => setConfirmLeave(null)} onConfirm={() => { const go = confirmLeave; setConfirmLeave(null); go?.(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.giant },
  pair: { flexDirection: 'row', gap: spacing.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
