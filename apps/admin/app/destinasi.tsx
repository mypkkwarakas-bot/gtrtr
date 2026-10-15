import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppHeader, AppText, colors, ConfirmationSheet, directionsUrl, ErrorState, formatDateTime, FormField, friendlyMessage, LoadingState, parseCoordinate,
  PrimaryButton, SecondaryButton, spacing, useToast, validateLatitude, validateLongitude, validateMaxLength,
} from '@fg/shared';
import { EVENT_KEY, fetchEvent, updateDestination } from '../src/content';

export default function DestinasiScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({ queryKey: EVENT_KEY, queryFn: fetchEvent });
  const e = q.data;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<(() => void) | null>(null);
  const loaded = useRef(false);
  const saved = useRef(false);

  useEffect(() => {
    if (e && !loaded.current) {
      loaded.current = true;
      setName(e.destination_name ?? '');
      setAddress(e.destination_address ?? '');
      setLat(e.destination_lat != null ? String(e.destination_lat) : '');
      setLng(e.destination_lng != null ? String(e.destination_lng) : '');
    }
  }, [e]);

  const dirty = !!e && (name !== (e.destination_name ?? '') || address !== (e.destination_address ?? '') || lat !== (e.destination_lat != null ? String(e.destination_lat) : '') || lng !== (e.destination_lng != null ? String(e.destination_lng) : ''));
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  useEffect(() => navigation.addListener('beforeRemove', (ev) => {
    if (!dirtyRef.current || saved.current) return;
    ev.preventDefault();
    setConfirmLeave(() => () => navigation.dispatch(ev.data.action));
  }), [navigation]);

  const save = useMutation({
    mutationFn: updateDestination,
    onSuccess: async (_d, vars) => {
      saved.current = true;
      await qc.invalidateQueries({ queryKey: EVENT_KEY });
      toast('success', vars.lat == null ? 'Destinasi dikosongkan.' : 'Destinasi disimpan. Semua aplikasi memakai titik ini.');
      router.back();
    },
    onError: (err) => { setConfirmClear(false); setFormError(friendlyMessage(err)); },
  });

  const submit = () => {
    if (save.isPending) return;
    const hasLat = lat.trim() !== '';
    const hasLng = lng.trim() !== '';
    const next = {
      name: validateMaxLength(name, 120, 'Nama destinasi'),
      address: validateMaxLength(address, 300, 'Alamat'),
      lat: hasLat || hasLng ? validateLatitude(lat) : undefined,
      lng: hasLat || hasLng ? validateLongitude(lng) : undefined,
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;
    save.mutate({ name, address, lat: hasLat ? parseCoordinate(lat) : null, lng: hasLng ? parseCoordinate(lng) : null });
  };

  const validPoint = !validateLatitude(lat) && !validateLongitude(lng);

  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} />;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Destinasi" subtitle="Titik tujuan bersama semua aplikasi" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <FormField label="Nama destinasi" value={name} onChangeText={setName} error={errors.name} placeholder="Contoh: Lokasi acara" maxLength={120} />
        <FormField label="Alamat" value={address} onChangeText={setAddress} error={errors.address} placeholder="Opsional" multiline style={{ minHeight: 72, textAlignVertical: 'top' }} maxLength={300} />
        <View style={styles.pair}>
          <View style={{ flex: 1 }}><FormField label="Latitude" value={lat} onChangeText={setLat} error={errors.lat} keyboardType="numbers-and-punctuation" placeholder="-6.12345" /></View>
          <View style={{ flex: 1 }}><FormField label="Longitude" value={lng} onChangeText={setLng} error={errors.lng} keyboardType="numbers-and-punctuation" placeholder="106.12345" /></View>
        </View>
        <AppText variant="caption" color={colors.inkMuted}>Salin koordinat dari Google Maps (tekan lama pada titik, lalu salin angkanya). Titik ini dipakai untuk jarak, perkiraan tiba, dan peta di semua aplikasi.</AppText>
        {validPoint ? (
          <SecondaryButton label="Periksa titik di Google Maps" icon="map-outline" onPress={() => void Linking.openURL(directionsUrl({ latitude: parseCoordinate(lat), longitude: parseCoordinate(lng) }))} />
        ) : null}
        {e?.destination_updated_at ? <AppText variant="caption" color={colors.inkMuted}>Terakhir diubah {formatDateTime(e.destination_updated_at)}</AppText> : null}
        {formError ? <AppText variant="bodyStrong" color={colors.danger} accessibilityLiveRegion="polite">{formError}</AppText> : null}
        <PrimaryButton label="Simpan destinasi" icon="checkmark" onPress={submit} loading={save.isPending} />
        {e?.destination_lat != null ? <SecondaryButton label="Kosongkan destinasi" icon="close-circle-outline" danger onPress={() => setConfirmClear(true)} disabled={save.isPending} /> : null}
      </ScrollView>
      <ConfirmationSheet visible={confirmClear} title="Kosongkan destinasi?" message="Jarak dan perkiraan tiba tidak akan ditampilkan sampai destinasi ditetapkan lagi." confirmLabel="Kosongkan" danger loading={save.isPending} onCancel={() => setConfirmClear(false)} onConfirm={() => save.mutate({ name: '', address: '', lat: null, lng: null })} />
      <ConfirmationSheet visible={confirmLeave !== null} title="Buang perubahan?" message="Perubahan yang belum disimpan akan hilang." confirmLabel="Buang" cancelLabel="Lanjut mengisi" danger onCancel={() => setConfirmLeave(null)} onConfirm={() => { const go = confirmLeave; setConfirmLeave(null); go?.(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.giant },
  pair: { flexDirection: 'row', gap: spacing.md },
});
