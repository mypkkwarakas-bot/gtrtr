import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, AppText, colors, EmptyState, ErrorState, friendlyMessage, HIT, LoadingState, Participant, PremiumCard, PrimaryButton, radius, SearchField, spacing, StatusChip } from '@fg/shared';
import { fetchFleets, FLEETS_KEY } from '../../../src/admin/fleets';
import { fetchParticipants, PARTICIPANTS_KEY } from '../../../src/admin/participants';

type Filter = 'aktif' | 'tanpa_armada' | 'nonaktif' | 'semua';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'tanpa_armada', label: 'Belum ada armada' },
  { key: 'nonaktif', label: 'Nonaktif' },
  { key: 'semua', label: 'Semua' },
];

export default function PesertaList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('aktif');
  const pq = useQuery({ queryKey: PARTICIPANTS_KEY, queryFn: fetchParticipants });
  const fq = useQuery({ queryKey: FLEETS_KEY, queryFn: fetchFleets });
  const fleetName = useMemo(() => new Map((fq.data ?? []).map((f) => [f.id, f.name])), [fq.data]);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (pq.data ?? []).filter((p) => {
      if (filter === 'aktif' && !p.is_active) return false;
      if (filter === 'nonaktif' && p.is_active) return false;
      if (filter === 'tanpa_armada' && (!p.is_active || p.fleet_id)) return false;
      return !s || p.full_name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s);
    });
  }, [pq.data, search, filter]);

  const activeCount = (pq.data ?? []).filter((p) => p.is_active).length;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Peserta" subtitle={pq.data ? `${activeCount} peserta aktif` : undefined} />
      <View style={styles.tools}>
        <SearchField value={search} onChangeText={setSearch} placeholder="Cari nama atau kode" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {FILTERS.map((f) => (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} accessibilityRole="radio" accessibilityState={{ selected: filter === f.key }} style={[styles.pill, filter === f.key && styles.pillOn]}>
              <AppText variant="bodyStrong" color={filter === f.key ? colors.white : colors.inkSoft}>{f.label}</AppText>
            </Pressable>
          ))}
        </ScrollView>
        <PrimaryButton label="Tambah peserta" icon="person-add-outline" onPress={() => router.push('/admin/peserta/form')} />
      </View>
      {pq.isLoading ? <LoadingState /> : pq.isError ? (
        <ErrorState message={friendlyMessage(pq.error)} onRetry={() => void pq.refetch()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          initialNumToRender={20}
          refreshControl={<RefreshControl refreshing={pq.isRefetching} onRefresh={() => { void pq.refetch(); void fq.refetch(); }} tintColor={colors.emerald600} />}
          ListEmptyComponent={<EmptyState icon="people-outline" title={search || filter !== 'aktif' ? 'Tidak ada peserta yang cocok' : 'Belum ada peserta'} message={search ? 'Coba kata kunci lain.' : undefined} />}
          renderItem={({ item }) => <Row p={item} fleet={item.fleet_id ? fleetName.get(item.fleet_id) : undefined} onPress={() => router.push({ pathname: '/admin/peserta/form', params: { id: item.id } })} />}
        />
      )}
    </View>
  );
}

function Row({ p, fleet, onPress }: { p: Participant; fleet?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Peserta ${p.full_name}`}>
      <PremiumCard style={styles.row}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="h3" numberOfLines={1}>{p.full_name}</AppText>
          <AppText variant="caption" color={colors.inkMuted}>Kode {p.code}</AppText>
          <View style={styles.chips}>
            {!p.is_active ? <StatusChip meta={{ label: 'Nonaktif', tone: 'neutral', icon: 'pause-circle-outline' }} /> : null}
            {p.is_active && fleet ? <StatusChip meta={{ label: fleet, tone: 'info', icon: 'bus-outline' }} /> : null}
            {p.is_active && !p.fleet_id ? <StatusChip meta={{ label: 'Belum ada armada', tone: 'warning', icon: 'alert-circle-outline' }} /> : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.inkFaint} style={{ minWidth: HIT / 2 }} />
      </PremiumCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tools: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.giant, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { minHeight: 40, paddingHorizontal: spacing.lg, justifyContent: 'center', borderRadius: radius.chip, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface },
  pillOn: { backgroundColor: colors.emerald700, borderColor: colors.emerald700 },
});
