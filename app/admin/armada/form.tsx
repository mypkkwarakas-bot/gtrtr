import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppHeader, AppText, ConfirmationSheet, colors, FleetIconPicker, FormField, friendlyMessage, LoadingState, PrimaryButton, SecondaryButton, spacing, useToast, validateMaxLength, validateRequired } from '@fg/shared';
import { createFleet, fetchFleets, FLEETS_KEY, iconUsage, updateFleet } from '../../../src/admin/fleets';

export default function FleetForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const toast = useToast();
  const fleetsQ = useQuery({ queryKey: FLEETS_KEY, queryFn: fetchFleets });
  const existing = useMemo(() => fleetsQ.data?.find((f) => f.id === id), [fleetsQ.data, id]);

  const [name, setName] = useState('');
  const [iconKey, setIconKey] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<(() => void) | null>(null);
  const loaded = useRef(false);
  const saved = useRef(false);

  useEffect(() => {
    if (existing && !loaded.current) {
      loaded.current = true;
      setName(existing.name);
      setIconKey(existing.icon_key);
      setActive(existing.is_active);
    }
  }, [existing]);

  const dirtyRef = useRef(false);
  const dirty = !saved.current && (existing ? name !== existing.name || iconKey !== existing.icon_key || active !== existing.is_active : name.trim().length > 0 || iconKey !== null);

  dirtyRef.current = dirty;
  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e) => {
      if (!dirtyRef.current || saved.current) return;
      e.preventDefault();
      setConfirmLeave(() => () => navigation.dispatch(e.data.action));
    });
    return sub;
  }, [navigation, dirty]);

  const save = useMutation({
    mutationFn: async (input: { name: string; icon_key: string | null; is_active: boolean }) => (id ? updateFleet(id, input) : createFleet(input)),
    onSuccess: async () => {
      saved.current = true;
      await qc.invalidateQueries({ queryKey: FLEETS_KEY });
      toast('success', id ? 'Armada berhasil diperbarui.' : 'Armada berhasil ditambahkan.');
      router.back();
    },
    onError: (e) => setFormError(friendlyMessage(e)),
  });

  const submit = (nextActive: boolean) => {
    if (save.isPending) return;
    const err = validateRequired(name, 'Nama armada') ?? validateMaxLength(name, 60, 'Nama armada');
    setNameError(err);
    setFormError(null);
    if (err) return;
    save.mutate({ name, icon_key: iconKey, is_active: nextActive });
  };

  if (id && fleetsQ.isLoading) return <LoadingState />;
  const usage = iconUsage(fleetsQ.data ?? [], id);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={id ? 'Ubah armada' : 'Armada baru'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <FormField label="Nama armada" value={name} onChangeText={setName} error={nameError} placeholder="Contoh: Armada 1" maxLength={60} />
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" color={colors.inkSoft}>Ikon armada</AppText>
          <AppText variant="caption" color={colors.inkMuted}>Dipilih Admin. Ikon yang sama tampil di aplikasi Kepala Rombongan.</AppText>
          <FleetIconPicker value={iconKey} onChange={setIconKey} usedBy={usage} disabled={save.isPending} />
        </View>
        {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
        <PrimaryButton label="Simpan" icon="checkmark" onPress={() => submit(active)} loading={save.isPending} />
        {id && active ? <SecondaryButton label="Nonaktifkan armada" icon="pause-circle-outline" danger onPress={() => setConfirmDeactivate(true)} disabled={save.isPending} /> : null}
        {id && !active ? <SecondaryButton label="Aktifkan kembali" icon="play-circle-outline" onPress={() => { setActive(true); submit(true); }} disabled={save.isPending} /> : null}
      </ScrollView>
      <ConfirmationSheet
        visible={confirmDeactivate}
        title="Nonaktifkan armada?"
        message="Armada tidak akan tampil di daftar aktif dan peta. Data tidak dihapus dan armada dapat diaktifkan kembali."
        confirmLabel="Nonaktifkan"
        danger
        loading={save.isPending}
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => { setConfirmDeactivate(false); setActive(false); submit(false); }}
      />
      <ConfirmationSheet
        visible={confirmLeave !== null}
        title="Buang perubahan?"
        message="Perubahan yang belum disimpan akan hilang."
        confirmLabel="Buang"
        cancelLabel="Lanjut mengisi"
        danger
        onCancel={() => setConfirmLeave(null)}
        onConfirm={() => { const go = confirmLeave; setConfirmLeave(null); go?.(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.giant } });
