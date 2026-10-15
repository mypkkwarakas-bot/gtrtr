import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  AppHeader, AppText, colors, countdownLabel, EmptyState, ErrorState, eventDateTime, formatClockInput, formatDateLong, formatDateTime,
  friendlyMessage, LoadingState, PremiumCard, SectionHeader, spacing,
} from '@fg/shared';
import { fetchAnnouncements, fetchEvent, fetchSchedules } from '../../src/info';

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  const event = useQuery({ queryKey: ['event'], queryFn: fetchEvent });
  const schedules = useQuery({ queryKey: ['schedules'], queryFn: fetchSchedules });
  const announcements = useQuery({ queryKey: ['announcements'], queryFn: fetchAnnouncements });
  const all = [event, schedules, announcements];
  const refreshing = all.some((q) => q.isRefetching);
  const refetch = () => all.forEach((q) => void q.refetch());
  const err = all.find((q) => q.error)?.error;
  const loading = all.some((q) => q.isLoading);

  const e = event.data;
  const start = e ? eventDateTime(e.event_date, e.start_time) : null;
  const countdown = countdownLabel(start);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Info kegiatan" />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.emerald700} />}
      >
        {loading ? <LoadingState /> : null}
        {err ? <ErrorState message={friendlyMessage(err)} onRetry={refetch} /> : null}

        {e && (e.event_name || e.event_date || e.general_info || e.contact_info) ? (
          <PremiumCard>
            {e.event_name ? <AppText variant="title">{e.event_name}</AppText> : null}
            {e.event_date ? (
              <AppText variant="bodyStrong">
                {formatDateLong(e.event_date)}{e.start_time ? ` · ${formatClockInput(e.start_time)} WIB` : ''}{countdown ? ` · ${countdown}` : ''}
              </AppText>
            ) : null}
            {e.description ? <AppText variant="body">{e.description}</AppText> : null}
            {e.general_info ? <AppText variant="body" color={colors.inkMuted}>{e.general_info}</AppText> : null}
            {e.contact_info ? <AppText variant="body">Kontak panitia: {e.contact_info}</AppText> : null}
          </PremiumCard>
        ) : null}

        {announcements.data ? (
          <>
            <SectionHeader title="Pengumuman" />
            {announcements.data.length === 0 ? (
              <EmptyState icon="megaphone-outline" title="Belum ada pengumuman" message="Pengumuman dari panitia akan muncul di sini." />
            ) : (
              announcements.data.map((a) => (
                <PremiumCard key={a.id}>
                  {a.title ? <AppText variant="bodyStrong">{a.title}</AppText> : null}
                  <AppText variant="body">{a.body}</AppText>
                  {a.published_at ? <AppText variant="caption" color={colors.inkMuted}>{formatDateTime(a.published_at)}</AppText> : null}
                </PremiumCard>
              ))
            )}
          </>
        ) : null}

        {schedules.data ? (
          <>
            <SectionHeader title="Jadwal" />
            {schedules.data.length === 0 ? (
              <EmptyState icon="calendar-outline" title="Belum ada jadwal" message="Jadwal yang dipublikasikan panitia akan muncul di sini." />
            ) : (
              schedules.data.map((s) => (
                <PremiumCard key={s.id}>
                  <AppText variant="label" color={colors.gold700}>{formatDateTime(s.starts_at)}{s.ends_at ? ` – ${formatDateTime(s.ends_at)}` : ''}</AppText>
                  <AppText variant="bodyStrong">{s.title}</AppText>
                  {s.location ? <AppText variant="body" color={colors.inkMuted}>{s.location}</AppText> : null}
                  {s.description ? <AppText variant="body">{s.description}</AppText> : null}
                </PremiumCard>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
});
