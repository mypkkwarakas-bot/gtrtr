import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppHeader, AppText, colors, EmptyState, ErrorState, formatDateTime, friendlyMessage, HIT, LoadingState, PremiumCard, PrimaryButton, publishStatusMeta, spacing, StatusChip } from '@fg/shared';
import { ANNOUNCEMENTS_KEY, fetchAnnouncements } from '../../src/content';

export default function PengumumanList() {
  const router = useRouter();
  const q = useQuery({ queryKey: ANNOUNCEMENTS_KEY, queryFn: fetchAnnouncements });
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Pengumuman" subtitle={q.data ? `${q.data.filter((a) => a.status === 'published').length} terpublikasi` : undefined} onBack={() => router.back()} />
      <View style={styles.tools}>
        <PrimaryButton label="Tambah pengumuman" icon="add" onPress={() => router.push('/pengumuman/form')} />
      </View>
      {q.isLoading ? <LoadingState /> : q.isError ? (
        <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <FlatList
          data={q.data ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={colors.emerald700} />}
          ListEmptyComponent={<EmptyState icon="megaphone-outline" title="Belum ada pengumuman" message="Pengumuman terpublikasi tampil di aplikasi Kepala Rombongan dan PWA Peserta." />}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Ubah pengumuman ${item.title ?? ''}`} onPress={() => router.push({ pathname: '/pengumuman/form', params: { id: item.id } })} style={{ minHeight: HIT }}>
              <PremiumCard>
                <View style={styles.row}>
                  <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>{item.title || 'Tanpa judul'}</AppText>
                  <StatusChip meta={publishStatusMeta(item.status)} />
                </View>
                <AppText variant="body" color={colors.inkMuted} numberOfLines={2}>{item.body}</AppText>
                {item.published_at ? <AppText variant="caption" color={colors.inkMuted}>Dipublikasikan {formatDateTime(item.published_at)}</AppText> : null}
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
