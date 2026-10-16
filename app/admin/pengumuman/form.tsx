import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppHeader, AppText, colors, ConfirmationSheet, FormField, friendlyMessage, LoadingState, PrimaryButton, PublishStatus, SecondaryButton, spacing, useToast,
  validateMaxLength, validatePositiveInt, validateRequired,
} from '@fg/shared';
import { ANNOUNCEMENTS_KEY, createAnnouncement, deleteAnnouncement, fetchAnnouncements, updateAnnouncement } from '../../../src/admin/content';
import { StatusPicker } from '../../../src/admin/StatusPicker';

export default function PengumumanForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: ANNOUNCEMENTS_KEY, queryFn: fetchAnnouncements });
  const existing = useMemo(() => q.data?.find((a) => a.id === id), [q.data, id]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [order, setOrder] = useState('0');
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
      setTitle(existing.title ?? '');
      setBody(existing.body);
      setOrder(String(existing.sort_order));
      setStatus(existing.status);
    }
  }, [existing]);

  const dirty = existing
    ? title !== (existing.title ?? '') || body !== existing.body || order !== String(existing.sort_order) || status !== existing.status
    : title.trim().length > 0 || body.trim().length > 0;
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  useEffect(() => navigation.addListener('beforeRemove', (e) => {
    if (!dirtyRef.current || saved.current) return;
    e.preventDefault();
    setConfirmLeave(() => () => navigation.dispatch(e.data.action));
  }), [navigation]);

  const onDone = (msg: string) => async () => {
    saved.current = true;
    await qc.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY });
    toast('success', msg);
    router.back();
  };
  const save = useMutation({
    mutationFn: async (input: Parameters<typeof createAnnouncement>[0]) => (id ? updateAnnouncement(id, input, existing) : createAnnouncement(input)),
    onSuccess: onDone(id ? 'Pengumuman berhasil diperbarui.' : 'Pengumuman berhasil ditambahkan.'),
    onError: (e) => setFormError(friendlyMessage(e)),
  });
  const remove = useMutation({
    mutationFn: async () => deleteAnnouncement(id as string),
    onSuccess: onDone('Pengumuman dihapus.'),
    onError: (e) => { setConfirmDelete(false); setFormError(friendlyMessage(e)); },
  });

  const submit = () => {
    if (save.isPending) return;
    const next = {
      title: validateMaxLength(title, 120, 'Judul'),
      body: validateRequired(body, 'Isi pengumuman') ?? validateMaxLength(body, 2000, 'Isi pengumuman'),
      order: validatePositiveInt(order, 'Urutan', 0),
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;
    save.mutate({ title, body, status, sort_order: parseInt(order, 10) });
  };

  if (id && q.isLoading) return <LoadingState />;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={id ? 'Ubah pengumuman' : 'Pengumuman baru'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <FormField label="Judul" value={title} onChangeText={setTitle} error={errors.title} placeholder="Opsional" maxLength={120} />
        <FormField label="Isi pengumuman" value={body} onChangeText={setBody} error={errors.body} multiline numberOfLines={6} maxLength={2000} style={{ minHeight: 140, textAlignVertical: 'top' }} />
        <FormField label="Urutan tampil" value={order} onChangeText={setOrder} error={errors.order} keyboardType="number-pad" hint="Angka kecil tampil lebih dulu." maxLength={4} />
        <StatusPicker value={status} onChange={setStatus} hint="Hanya pengumuman terpublikasi yang terlihat oleh Kepala Rombongan dan Peserta." />
        {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
        <PrimaryButton label="Simpan" icon="checkmark" onPress={submit} loading={save.isPending} />
        {id ? <SecondaryButton label="Hapus pengumuman" icon="trash-outline" danger onPress={() => setConfirmDelete(true)} disabled={save.isPending} /> : null}
      </ScrollView>
      <ConfirmationSheet visible={confirmDelete} title="Hapus pengumuman?" message="Pengumuman dihapus permanen. Untuk menyembunyikan tanpa menghapus, ubah statusnya menjadi Diarsipkan." confirmLabel="Hapus" danger loading={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={() => remove.mutate()} />
      <ConfirmationSheet visible={confirmLeave !== null} title="Buang perubahan?" message="Perubahan yang belum disimpan akan hilang." confirmLabel="Buang" cancelLabel="Lanjut mengisi" danger onCancel={() => setConfirmLeave(null)} onConfirm={() => { const go = confirmLeave; setConfirmLeave(null); go?.(); }} />
    </View>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.giant } });
