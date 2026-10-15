import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AdminDashboardData, AppHeader, AppText, colors, ErrorState, friendlyMessage, HeroCard, IconButton, LoadingState, rpcOk, SectionHeader, spacing, StatCard } from '@fg/shared';
import { useAuth } from '../../src/auth';
import { supabase } from '../../src/supabase';

export default function Beranda() {
  const { signOut } = useAuth();
  const q = useQuery({ queryKey: ['admin_dashboard'], queryFn: async () => (await rpcOk<AdminDashboardData>(supabase, 'admin_dashboard')).data });
  const d = q.data;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Beranda" subtitle="Family Gathering KLKM Jakarta Utara" right={<IconButton icon="log-out-outline" label="Keluar" onPress={() => void signOut()} />} />
      {q.isLoading ? <LoadingState /> : q.isError || !d ? (
        <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={colors.emerald600} />}>
          <HeroCard>
            <AppText variant="label" color={colors.gold300}>Perjalanan berlangsung</AppText>
            <AppText variant="statLarge" color={colors.white}>{d.trips_active}</AppText>
            <AppText variant="body" color={colors.emerald100}>dari {d.fleets_active} armada aktif · {d.leaders_assigned} kepala rombongan bertugas</AppText>
          </HeroCard>
          <SectionHeader title="Ringkasan" />
          <View style={styles.row}>
            <StatCard label="Peserta" value={String(d.participants_active)} hint={`${d.participants_unassigned} belum ada armada`} />
            <StatCard label="Armada" value={String(d.fleets_active)} />
          </View>
          <SectionHeader title="Status lokasi" />
          <View style={styles.row}>
            <StatCard label="Terkini" value={String(d.tracking.fresh)} />
            <StatCard label="Tertunda" value={String(d.tracking.late)} />
            <StatCard label="Lama" value={String(d.tracking.stale)} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.giant },
  row: { flexDirection: 'row', gap: spacing.md },
});
