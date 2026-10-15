import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppHeader, AppText, colors, EmptyState, ErrorState, formatDateTime, friendlyMessage, HIT, LoadingState, PremiumCard, PrimaryButton, publishStatusMeta, spacing, StatusChip } from '@fg/shared';
import { fetchSchedules, SCHEDULES_KEY } from '../../src/content';

export default function JadwalList() {
  const router = useRouter();
  const q = useQuery({ queryKey: SCHEDULES_KEY, queryFn: fetchSchedules });
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Jadwal" subtitle={q.data ? `${q.data.filter((s) => s.status === 'published').length} terpublikasi` : undefined} onBack={() => router.back()} />
      <View style={styles.tools}>
        <PrimaryButton label="Tambah jadwal" icon="add" onPress={() => router.push('/jadwal/form')} />
      </View>
      {q.isLoading ? <LoadingState /> : q.isError ? (
        <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <FlatList
          data={q.data ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={colors.emerald700} />}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="Belum ada jadwal" message="Tambahkan agenda kegiatan. Hanya jadwal terpublikasi yang terlihat oleh Kepala Rombongan dan Peserta." />}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Ubah jadwal ${item.title}`} onPress={() => router.push({ pathname: '/jadwal/form', params: { id: item.id } })} style={{ minHeight: HIT }}>
              <PremiumCard>
                <View style={styles.row}>
                  <AppText variant="label" color={colors.gold700} style={{ flex: 1 }}>{formatDateTime(item.starts_at)}</AppText>
                  <StatusChip meta={publishStatusMeta(item.status)} />
                </View>
                <AppText variant="bodyStrong">{item.title}</AppText>
                {item.location ? <AppText variant="body" color={colors.inkMuted}>{item.location}</AppText> : null}
              </PremiumCard>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tools: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.giant },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
