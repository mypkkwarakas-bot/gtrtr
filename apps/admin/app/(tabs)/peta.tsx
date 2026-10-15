import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  AppHeader, AppText, colors, EmptyState, ErrorState, FleetIcon, FleetMapPayload, formatDistance, friendlyMessage, HIT, LatLng, liveTrackingStatus,
  LoadingState, mapsConfigured, PremiumCard, regionFor, relativeAge, rpcOk, spacing, StatusChip, trackingStatusMeta,
} from '@fg/shared';
import { supabase } from '../../src/supabase';
import { EVENT_KEY, FLEET_MAP_KEY, fetchEvent } from '../../src/content';

export default function PetaGlobal() {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10_000); return () => clearInterval(t); }, []);

  const map = useQuery({
    queryKey: FLEET_MAP_KEY,
    queryFn: async () => (await rpcOk<FleetMapPayload>(supabase, 'get_fleet_map')).data,
    refetchInterval: 15_000,
  });
  const event = useQuery({ queryKey: EVENT_KEY, queryFn: fetchEvent });

  const p = map.data;
  // Selisih jam server-klien saat data diambil, agar status di antara dua pengambilan tetap akurat.
  const offset = p ? new Date(p.server_now).getTime() - map.dataUpdatedAt : 0;
  const rows = useMemo(() => (p?.fleets ?? []).map((r) => {
    const has = r.latitude != null && r.longitude != null;
    const status = liveTrackingStatus({ tripActive: r.trip_active, hasLocation: has, lastContactAt: r.last_contact_at, thresholds: p!.thresholds, serverOffsetMs: offset, now });
    const age = r.last_contact_at ? Math.max(0, Math.floor((now + offset - new Date(r.last_contact_at).getTime()) / 1000)) : null;
    return { ...r, has, status, age };
  }), [p, offset, now]);

  const e = event.data;
  const dest: LatLng | null = e?.destination_lat != null && e?.destination_lng != null ? { latitude: e.destination_lat, longitude: e.destination_lng } : null;
  const pts = [...rows.filter((r) => r.has).map((r) => ({ latitude: r.latitude as number, longitude: r.longitude as number })), ...(dest ? [dest] : [])];
  const region = regionFor(pts);

  const header = (
    <View style={{ gap: spacing.md }}>
      {region && mapsConfigured() ? (
        <View style={styles.mapWrap}>
          <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_GOOGLE} region={region} accessibilityLabel="Peta semua armada">
            {rows.filter((r) => r.has).map((r) => (
              <Marker key={r.fleet_id} coordinate={{ latitude: r.latitude as number, longitude: r.longitude as number }} title={r.fleet_name} description={trackingStatusMeta(r.status).label} pinColor={r.status === 'fresh' ? colors.emerald700 : r.status === 'stale' ? colors.danger : colors.gold700} onCalloutPress={() => router.push(`/armada/${r.fleet_id}`)} />
            ))}
            {dest ? <Marker coordinate={dest} title={e?.destination_name ?? 'Destinasi'} pinColor={colors.info} /> : null}
          </MapView>
        </View>
      ) : region ? (
        <PremiumCard>
          <AppText variant="bodyStrong">Peta belum dapat ditampilkan</AppText>
          <AppText variant="body" color={colors.inkMuted}>Kunci Google Maps belum dikonfigurasi pada build ini (GOOGLE_MAPS_ANDROID_API_KEY). Daftar armada di bawah tetap akurat.</AppText>
        </PremiumCard>
      ) : null}
      <AppText variant="caption" color={colors.inkMuted}>Diperbarui otomatis tiap 15 detik. Tarik ke bawah untuk menyegarkan sekarang.</AppText>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Peta armada" subtitle={p ? `${rows.length} armada aktif` : undefined} />
      {map.isLoading ? <LoadingState label="Memuat peta…" /> : map.isError ? (
        <ErrorState message={friendlyMessage(map.error)} onRetry={() => void map.refetch()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.fleet_id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          refreshControl={<RefreshControl refreshing={map.isRefetching} onRefresh={() => { void map.refetch(); void event.refetch(); }} tintColor={colors.emerald700} />}
          ListEmptyComponent={<EmptyState icon="bus-outline" title="Belum ada armada aktif" message="Tambahkan armada di tab Armada." />}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Detail ${item.fleet_name}`} onPress={() => router.push(`/armada/${item.fleet_id}`)} style={{ minHeight: HIT }}>
              <PremiumCard>
                <View style={styles.row}>
                  <FleetIcon iconKey={item.icon_key} size={44} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="bodyStrong">{item.fleet_name}</AppText>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {item.has ? `Kontak terakhir ${relativeAge(item.age)}` : 'Belum ada lokasi'}
                      {item.distance_to_destination_m != null ? ` · ${formatDistance(item.distance_to_destination_m)} ke destinasi` : ''}
                    </AppText>
                  </View>
                </View>
                <StatusChip meta={trackingStatusMeta(item.status)} />
              </PremiumCard>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.giant },
  mapWrap: { height: 320, borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
});
