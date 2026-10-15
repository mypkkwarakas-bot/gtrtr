import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, AppText, colors, EmptyState, ErrorState, Fleet, FleetIcon, friendlyMessage, HIT, LoadingState, PremiumCard, PrimaryButton, SearchField, spacing, StatusChip } from '@fg/shared';
import { fetchFleets, FLEETS_KEY } from '../../src/fleets';

export default function ArmadaList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const q = useQuery({ queryKey: FLEETS_KEY, queryFn: fetchFleets });
  const rows = useMemo(() => (q.data ?? []).filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase())), [q.data, search]);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Armada" subtitle={q.data ? `${q.data.filter((f) => f.is_active).length} armada aktif` : undefined} />
      <View style={styles.tools}>
        <SearchField value={search} onChangeText={setSearch} placeholder="Cari armada" />
        <PrimaryButton label="Tambah armada" icon="add" onPress={() => router.push('/armada/form')} />
      </View>
      {q.isLoading ? <LoadingState /> : q.isError ? (
        <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={colors.emerald600} />}
          ListEmptyComponent={<EmptyState icon="bus-outline" title={search ? 'Armada tidak ditemukan' : 'Belum ada armada'} message={search ? 'Coba kata kunci lain.' : 'Tambahkan armada pertama untuk mulai mengatur rombongan.'} />}
          renderItem={({ item }) => <FleetRow fleet={item} onPress={() => router.push({ pathname: '/armada/[id]', params: { id: item.id } })} />}
        />
      )}
    </View>
  );
}

function FleetRow({ fleet, onPress }: { fleet: Fleet; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Armada ${fleet.name}`} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <PremiumCard style={styles.row}>
        <FleetIcon iconKey={fleet.icon_key} size={56} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="h3" numberOfLines={1}>{fleet.name}</AppText>
          <StatusChip meta={fleet.is_active ? { label: 'Aktif', tone: 'success', icon: 'checkmark-circle-outline' } : { label: 'Nonaktif', tone: 'neutral', icon: 'pause-circle-outline' }} />
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
});
