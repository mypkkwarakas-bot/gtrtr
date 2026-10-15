import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, AppText, colors, ConfirmationSheet, FleetIcon, FormField, friendlyMessage, HIT, LoadingState, PremiumCard, PrimaryButton, radius, SecondaryButton, spacing, useToast, validateMaxLength, validateRequired } from '@fg/shared';
import { fetchFleets, FLEETS_KEY } from '../../src/fleets';
import { createParticipant, fetchParticipants, PARTICIPANTS_KEY, ParticipantInput, updateParticipant } from '../../src/participants';

export default function ParticipantForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const toast = useToast();
  const pq = useQuery({ queryKey: PARTICIPANTS_KEY, queryFn: fetchParticipants });
  const fq = useQuery({ queryKey: FLEETS_KEY, queryFn: fetchFleets });
  const existing = useMemo(() => pq.data?.find((p) => p.id === id), [pq.data, id]);
  const fleets = useMemo(() => (fq.data ?? []).filter((f) => f.is_active || f.id === existing?.fleet_id), [fq.data, existing]);

  const [name, setName] = useState('');
  const [fleetId, setFleetId] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<(() => void) | null>(null);
  const loaded = useRef(false);
  const saved = useRef(false);

  useEffect(() => {
    if (existing && !loaded.current) {
      loaded.current = true;
      setName(existing.full_name);
      setFleetId(existing.fleet_id);
      setActive(existing.is_active);
    }
  }, [existing]);

  const dirty = !saved.current && (existing ? name !== existing.full_name || fleetId !== existing.fleet_id || active !== existing.is_active : name.trim().length > 0 || fleetId !== null);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  useEffect(() => navigation.addListener('beforeRemove', (e) => {
    if (!dirtyRef.current || saved.current) return;
    e.preventDefault();
    setConfirmLeave(() => () => navigation.dispatch(e.data.action));
  }), [navigation, dirty]);

  const save = useMutation({
    mutationFn: (input: ParticipantInput) => (id ? updateParticipant(id, input) : createParticipant(input)),
    onSuccess: async () => {
      saved.current = true;
      await qc.invalidateQueries({ queryKey: PARTICIPANTS_KEY });
      toast('success', id ? 'Data peserta berhasil diperbarui.' : 'Peserta berhasil ditambahkan.');
      router.back();
    },
    onError: (e) => setFormError(friendlyMessage(e)),
  });

  const submit = (nextActive: boolean) => {
    if (save.isPending) return;
    const err = validateRequired(name, 'Nama lengkap') ?? validateMaxLength(name, 100, 'Nama lengkap');
    setNameError(err);
    setFormError(null);
    if (err) return;
    save.mutate({ full_name: name, fleet_id: fleetId, is_active: nextActive });
  };

  if (id && (pq.isLoading || fq.isLoading)) return <LoadingState />;
  if (id && !existing) return <View style={{ flex: 1 }}><AppHeader title="Peserta" onBack={() => router.back()} /><AppText style={{ padding: spacing.lg }}>Peserta tidak ditemukan.</AppText></View>;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={id ? 'Ubah peserta' : 'Peserta baru'} subtitle={existing ? `Kode ${existing.code}` : 'Kode dibuat otomatis'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <FormField label="Nama lengkap" value={name} onChangeText={setName} error={nameError} maxLength={100} autoCapitalize="words" />
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" color={colors.inkSoft}>Armada</AppText>
          <FleetChoice selected={fleetId === null} onPress={() => setFleetId(null)} title="Belum ada armada" />
          {fleets.map((f) => (
            <FleetChoice key={f.id} selected={fleetId === f.id} onPress={() => setFleetId(f.id)} title={f.name + (f.is_active ? '' : ' (nonaktif)')} iconKey={f.icon_key} />
          ))}
          {fq.isError ? <AppText variant="caption" color={colors.danger}>Daftar armada gagal dimuat: {friendlyMessage(fq.error)}</AppText> : null}
        </View>
        {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
        <PrimaryButton label="Simpan" icon="checkmark" onPress={() => submit(active)} loading={save.isPending} />
        {id && active ? <SecondaryButton label="Nonaktifkan peserta" icon="pause-circle-outline" danger onPress={() => setConfirmOff(true)} disabled={save.isPending} /> : null}
        {id && !active ? <SecondaryButton label="Aktifkan kembali" icon="play-circle-outline" onPress={() => { setActive(true); submit(true); }} disabled={save.isPending} /> : null}
      </ScrollView>
      <ConfirmationSheet visible={confirmOff} title="Nonaktifkan peserta?" message="Peserta tidak akan tampil di daftar aktif. Data tidak dihapus dan dapat diaktifkan kembali." confirmLabel="Nonaktifkan" danger loading={save.isPending} onCancel={() => setConfirmOff(false)} onConfirm={() => { setConfirmOff(false); setActive(false); submit(false); }} />
      <ConfirmationSheet visible={confirmLeave !== null} title="Buang perubahan?" message="Perubahan yang belum disimpan akan hilang." confirmLabel="Buang" cancelLabel="Lanjut mengisi" danger onCancel={() => setConfirmLeave(null)} onConfirm={() => { const go = confirmLeave; setConfirmLeave(null); go?.(); }} />
    </View>
  );
}

function FleetChoice({ selected, onPress, title, iconKey }: { selected: boolean; onPress: () => void; title: string; iconKey?: string | null }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      <PremiumCard style={[styles.choice, selected && styles.choiceOn]}>
        {iconKey !== undefined ? <FleetIcon iconKey={iconKey} size={40} /> : <Ionicons name="remove-circle-outline" size={28} color={colors.inkMuted} />}
        <AppText variant="bodyStrong" style={{ flex: 1 }}>{title}</AppText>
        <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={24} color={selected ? colors.emerald600 : colors.inkFaint} />
      </PremiumCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.giant },
  choice: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: HIT, paddingVertical: spacing.sm, borderRadius: radius.card },
  choiceOn: { borderColor: colors.emerald600, borderWidth: 1.5, backgroundColor: colors.emerald50 },
});
