import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppHeader, AppText, colors, ConfirmationSheet, FormField, friendlyMessage, LoadingState, parseDateInput, parseTimeInput, PrimaryButton,
  PublishStatus, SecondaryButton, spacing, useToast, validateDateInput, validateMaxLength, validateRequired, validateTimeInput, wibDayKey, wibParts, wibToISO,
} from '@fg/shared';
import { createSchedule, deleteSchedule, fetchSchedules, SCHEDULES_KEY, updateSchedule } from '../../../src/admin/content';
import { StatusPicker } from '../../../src/admin/StatusPicker';

const pad = (n: number) => String(n).padStart(2, '0');
const clock = (iso: string) => { const p = wibParts(iso); return `${pad(p.h)}:${pad(p.mi)}`; };

export default function JadwalForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: SCHEDULES_KEY, queryFn: fetchSchedules });
  const existing = useMemo(() => q.data?.find((s) => s.id === id), [q.data, id]);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PublishStatus>('draft');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<(() => void) | null>(null);
  const loaded = useRef(false);
  const saved = useRef(false);

  useEffect(() => {
    if (existing && !loaded.current) {
      loaded.current = true;
      setTitle(existing.title);
      setDate(wibDayKey(existing.starts_at));
      setStart(clock(existing.starts_at));
      setEnd(existing.ends_at ? clock(existing.ends_at) : '');
      setLocation(existing.location ?? '');
      setDescription(existing.description ?? '');
      setStatus(existing.status);
    }
  }, [existing]);

  const dirty = existing
    ? title !== existing.title || date !== wibDayKey(existing.starts_at) || start !== clock(existing.starts_at) || end !== (existing.ends_at ? clock(existing.ends_at) : '') || location !== (existing.location ?? '') || description !== (existing.description ?? '') || status !== existing.status
    : [title, date, start, end, location, description].some((v) => v.trim().length > 0);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  useEffect(() => navigation.addListener('beforeRemove', (e) => {
    if (!dirtyRef.current || saved.current) return;
    e.preventDefault();
    setConfirmLeave(() => () => navigation.dispatch(e.data.action));
  }), [navigation]);

  const onDone = (msg: string) => async () => {
    saved.current = true;
    await qc.invalidateQueries({ queryKey: SCHEDULES_KEY });
    toast('success', msg);
    router.back();
  };
  const save = useMutation({
    mutationFn: async (input: Parameters<typeof createSchedule>[0]) => (id ? updateSchedule(id, input) : createSchedule(input)),
    onSuccess: onDone(id ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.'),
    onError: (e) => setFormError(friendlyMessage(e)),
  });
  const remove = useMutation({
    mutationFn: async () => deleteSchedule(id as string),
    onSuccess: onDone('Jadwal dihapus.'),
    onError: (e) => { setConfirmDelete(false); setFormError(friendlyMessage(e)); },
  });

  const submit = () => {
    if (save.isPending) return;
    const next: Record<string, string | undefined> = {
      title: validateRequired(title, 'Judul') ?? validateMaxLength(title, 120, 'Judul'),
      date: validateDateInput(date, 'Tanggal'),
      start: validateTimeInput(start, 'Jam mulai'),
      end: validateTimeInput(end, 'Jam selesai', false),
    };
    if (!next.date && !next.start && !next.end && end.trim() && end.trim() <= start.trim()) next.end = 'Jam selesai harus setelah jam mulai';
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;
    const d = parseDateInput(date);
    const s = parseTimeInput(start);
    const e = end.trim() ? parseTimeInput(end) : null;
    save.mutate({
      title, description, location, status,
      starts_at: wibToISO(d.y, d.m, d.d, s.h, s.mi),
      ends_at: e ? wibToISO(d.y, d.m, d.d, e.h, e.mi) : null,
    });
  };

  if (id && q.isLoading) return <LoadingState />;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={id ? 'Ubah jadwal' : 'Jadwal baru'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <FormField label="Judul" value={title} onChangeText={setTitle} error={errors.title} maxLength={120} placeholder="Contoh: Keberangkatan armada" />
        <FormField label="Tanggal (WIB)" value={date} onChangeText={setDate} error={errors.date} placeholder="2026-11-15" keyboardType="numbers-and-punctuation" maxLength={10} />
        <View style={styles.pair}>
          <View style={{ flex: 1 }}><FormField label="Jam mulai" value={start} onChangeText={setStart} error={errors.start} placeholder="07:00" keyboardType="numbers-and-punctuation" maxLength={5} /></View>
          <View style={{ flex: 1 }}><FormField label="Jam selesai" value={end} onChangeText={setEnd} error={errors.end} placeholder="Opsional" keyboardType="numbers-and-punctuation" maxLength={5} /></View>
        </View>
        <FormField label="Lokasi" value={location} onChangeText={setLocation} placeholder="Opsional" />
        <FormField label="Keterangan" value={description} onChangeText={setDescription} placeholder="Opsional" multiline numberOfLines={4} style={{ minHeight: 96, textAlignVertical: 'top' }} />
        <StatusPicker value={status} onChange={setStatus} hint="Hanya jadwal terpublikasi yang terlihat oleh Kepala Rombongan dan Peserta." />
        {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
        <PrimaryButton label="Simpan" icon="checkmark" onPress={submit} loading={save.isPending} />
        {id ? <SecondaryButton label="Hapus jadwal" icon="trash-outline" danger onPress={() => setConfirmDelete(true)} disabled={save.isPending} /> : null}
      </ScrollView>
      <ConfirmationSheet visible={confirmDelete} title="Hapus jadwal?" message="Jadwal dihapus permanen. Untuk menyembunyikan tanpa menghapus, ubah statusnya menjadi Diarsipkan." confirmLabel="Hapus" danger loading={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={() => remove.mutate()} />
      <ConfirmationSheet visible={confirmLeave !== null} title="Buang perubahan?" message="Perubahan yang belum disimpan akan hilang." confirmLabel="Buang" cancelLabel="Lanjut mengisi" danger onCancel={() => setConfirmLeave(null)} onConfirm={() => { const go = confirmLeave; setConfirmLeave(null); go?.(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.giant },
  pair: { flexDirection: 'row', gap: spacing.md },
});
