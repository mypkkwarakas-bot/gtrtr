import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  AppHeader, AppText, colors, directionsUrl, EmptyState, ErrorState, FleetDetail, formatDistance, friendlyMessage, LoadingState, LatLng,
  mapsConfigured, MyAssignment, PremiumCard, regionFor, relativeAge, rpcOk, SecondaryButton, spacing, StatusChip, trackingStatusMeta,
} from '@fg/shared';
import { supabase } from '../../../src/supabase';

export default function PetaScreen() {
  const insets = useSafeAreaInsets();
  const assignment = useQuery({
    queryKey: ['my_assignment'],
    queryFn: async () => (await rpcOk<MyAssignment>(supabase, 'get_my_assignment')).data,
  });
  const fleetId = assignment.data?.fleet.id;
  const detail = useQuery({
    queryKey: ['fleet_detail', fleetId],
    enabled: !!fleetId,
    queryFn: async () => (await rpcOk<FleetDetail>(supabase, 'get_fleet_detail', { p_fleet_id: fleetId })).data,
    refetchInterval: 15_000,
  });

  const d = detail.data;
  const own: LatLng | null = d?.location ? { latitude: d.location.latitude, longitude: d.location.longitude } : null;
  const dest: LatLng | null = d?.destination ? { latitude: d.destination.latitude, longitude: d.destination.longitude } : null;
  const points = [own, dest].filter((p): p is LatLng => !!p);
  const region = regionFor(points);
  const err = assignment.error ?? detail.error;
  const loading = assignment.isLoading || (!!fleetId && detail.isLoading);
  const refetch = () => { void assignment.refetch(); void detail.refetch(); };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Peta perjalanan" subtitle={assignment.data?.fleet.name} />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={detail.isRefetching} onRefresh={refetch} tintColor={colors.emerald700} />}
      >
        {loading ? <LoadingState label="Memuat peta…" /> : null}
        {err ? <ErrorState message={friendlyMessage(err)} onRetry={refetch} /> : null}
        {d ? (
          <>
            {region && mapsConfigured() ? (
              <View style={styles.mapWrap}>
                <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_GOOGLE} region={region} accessibilityLabel="Peta lokasi armada dan destinasi">
                  {own ? <Marker coordinate={own} title={d.fleet.name} description="Lokasi terakhir diterima server" pinColor={colors.emerald700} /> : null}
                  {dest ? <Marker coordinate={dest} title={d.destination?.name ?? 'Destinasi'} description={d.destination?.address} pinColor={colors.gold700} /> : null}
                  {d.trail.length > 1 ? <Polyline coordinates={d.trail} strokeColor={colors.emerald700} strokeWidth={4} /> : null}
                </MapView>
              </View>
            ) : region ? (
              <PremiumCard>
                <AppText variant="bodyStrong">Peta belum dapat ditampilkan</AppText>
                <AppText variant="body" color={colors.inkMuted}>Kunci Google Maps belum dikonfigurasi pada build ini (GOOGLE_MAPS_ANDROID_API_KEY). Koordinat tetap ditampilkan di bawah.</AppText>
              </PremiumCard>
            ) : (
              <EmptyState icon="map-outline" title="Belum ada titik di peta" message="Lokasi armada belum diterima server dan destinasi belum ditetapkan panitia." />
            )}

            <PremiumCard>
              <StatusChip meta={trackingStatusMeta(d.status)} />
              {d.location ? (
                <>
                  <AppText variant="body">Lokasi terakhir diterima server: {relativeAge(d.location.age_seconds)}.</AppText>
                  {!mapsConfigured() ? <AppText variant="body" color={colors.inkMuted}>{d.location.latitude.toFixed(5)}, {d.location.longitude.toFixed(5)}</AppText> : null}
                  {d.location.accuracy_m != null ? <AppText variant="body" color={colors.inkMuted}>Akurasi sekitar {Math.round(d.location.accuracy_m)} m.</AppText> : null}
                </>
              ) : (
                <AppText variant="body" color={colors.inkMuted}>Belum ada lokasi dari perangkat Anda yang tersimpan di server.</AppText>
              )}
            </PremiumCard>

            {d.destination ? (
              <PremiumCard>
                <AppText variant="label" color={colors.gold700}>Destinasi</AppText>
                <AppText variant="bodyStrong">{d.destination.name ?? 'Destinasi kegiatan'}</AppText>
                {d.destination.address ? <AppText variant="body" color={colors.inkMuted}>{d.destination.address}</AppText> : null}
                {d.destination.distance_m != null ? <AppText variant="body">Jarak garis lurus: {formatDistance(d.destination.distance_m)}{d.destination.near_destination ? ' (sudah dekat)' : ''}</AppText> : null}
                {d.destination.eta_seconds != null ? <AppText variant="caption" color={colors.inkMuted}>Perkiraan {Math.max(1, Math.round(d.destination.eta_seconds / 60))} menit — {d.destination.eta_basis}.</AppText> : null}
                <SecondaryButton label="Buka navigasi" icon="navigate-outline" onPress={() => void Linking.openURL(directionsUrl(dest as LatLng))} />
              </PremiumCard>
            ) : (
              <PremiumCard>
                <AppText variant="body" color={colors.inkMuted}>Panitia belum menetapkan destinasi.</AppText>
              </PremiumCard>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  mapWrap: { height: 320, borderRadius: 20, overflow: 'hidden' },
});
