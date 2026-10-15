import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { AppHeader, MenuRow, spacing } from '@fg/shared';
import { ANNOUNCEMENTS_KEY, EVENT_KEY, fetchAnnouncements, fetchEvent, fetchSchedules, SCHEDULES_KEY } from '../../src/content';

export default function KelolaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const schedules = useQuery({ queryKey: SCHEDULES_KEY, queryFn: fetchSchedules });
  const announcements = useQuery({ queryKey: ANNOUNCEMENTS_KEY, queryFn: fetchAnnouncements });
  const event = useQuery({ queryKey: EVENT_KEY, queryFn: fetchEvent });
  const pub = (list?: { status: string }[]) => (list ? `${list.filter((x) => x.status === 'published').length} terpublikasi dari ${list.length}` : undefined);
  const dest = event.data ? (event.data.destination_lat != null ? event.data.destination_name ?? 'Titik sudah ditetapkan' : 'Belum ditetapkan') : undefined;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Kelola" subtitle="Konten dan pengaturan kegiatan" />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <MenuRow icon="calendar-outline" title="Jadwal" subtitle={pub(schedules.data)} onPress={() => router.push('/jadwal')} />
        <MenuRow icon="megaphone-outline" title="Pengumuman" subtitle={pub(announcements.data)} onPress={() => router.push('/pengumuman')} />
        <MenuRow icon="flag-outline" title="Destinasi" subtitle={dest} onPress={() => router.push('/destinasi')} />
        <MenuRow icon="settings-outline" title="Pengaturan" subtitle="Info kegiatan, peta, batas status lokasi, akun" onPress={() => router.push('/pengaturan')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg, gap: spacing.md } });
