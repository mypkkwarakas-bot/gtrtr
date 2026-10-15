import { useEffect, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  AppText, colors, ConfirmationSheet, EmptyState, ErrorState, FleetIcon, formatTime, friendlyMessage, HeroCard, isSessionError,
  LoadingState, MyAssignment, PremiumCard, PrimaryButton, rpcOk, SecondaryButton, SectionHeader, spacing, StatusChip, Trip, useToast,
} from '@fg/shared';
import { supabase } from '../../src/supabase';
import { useAuth } from '../../src/auth';
import { ensureLocationPermission, isTrackingActive, startTracking, stopTracking, useTrackingState } from '../../src/tracking';

const ASSIGNMENT_KEY = ['my_assignment'] as const;

export default function KepalaHome() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { signOut } = useAuth();
  const gps = useTrackingState();
  const [confirmOut, setConfirmOut] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permIssue, setPermIssue] = useState<string | null>(null);
  const [bgGranted, setBgGranted] = useState<boolean | null>(null);

  const q = useQuery({
    queryKey: ASSIGNMENT_KEY,
    queryFn: async () => (await rpcOk<MyAssignment>(supabase, 'get_my_assignment')).data,
    refetchInterval: 30_000,
  });
  const a = q.data;
  const tripId = a?.active_trip?.id ?? null;

  // Sinkronkan GPS dengan status perjalanan di server (pemulihan setelah aplikasi dibuka ulang,
  // dan berhenti bila server menyatakan perjalanan sudah berakhir).
  useEffect(() => {
    if (!a) return;
    let alive = true;
    (async () => {
      const on = await isTrackingActive();
      if (!alive) return;
      if (!tripId && on) { await stopTracking(); return; }
      if (tripId && !on) {
        const p = await ensureLocationPermission();
        if (!alive) return;
        if (p.result !== 'granted') {
          setPermIssue(p.result === 'denied' ? 'Izin lokasi belum diberikan.' : 'GPS perangkat dimatikan.');
          return;
        }
        setPermIssue(null);
        setBgGranted(p.background);
        try { await startTracking(tripId); } catch { setPermIssue('GPS gagal dinyalakan. Coba lagi.'); }
      }
    })();
    return () => { alive = false; };
  }, [a, tripId]);

  const start = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const p = await ensureLocationPermission();
      if (p.result !== 'granted') {
        setPermIssue(p.result === 'denied' ? 'Izin lokasi diperlukan untuk memulai perjalanan.' : 'Nyalakan GPS perangkat terlebih dahulu.');
        return;
      }
      setPermIssue(null);
      setBgGranted(p.background);
      const res = await rpcOk<Trip>(supabase, 'start_trip');
      try {
        await startTracking(res.data.id);
      } catch {
        await rpcOk(supabase, 'end_trip').catch(() => undefined); // batalkan agar server tidak mengira GPS berjalan
        toast('error', 'GPS gagal dinyalakan, perjalanan dibatalkan.');
        return;
      }
      toast('success', res.code === 'ALREADY_ACTIVE' ? 'Perjalanan sudah berjalan.' : 'Perjalanan dimulai.');
      await q.refetch();
    } catch (e) {
      toast('error', friendlyMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const end = async () => {
    setBusy(true);
    try {
      await rpcOk(supabase, 'end_trip');
      await stopTracking();
      toast('success', 'Perjalanan diakhiri.');
      setConfirmEnd(false);
      await q.refetch();
    } catch (e) {
      toast('error', friendlyMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const doSignOut = async () => {
    setSigningOut(true);
    try { await signOut(); } finally { setSigningOut(false); setConfirmOut(false); }
  };

  const sessionLost = q.error ? isSessionError(q.error) : false;
  const tripActive = !!a?.active_trip;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={colors.emerald700} />}
      >
        {q.isLoading ? <LoadingState label="Memuat penugasan…" /> : null}
        {q.error && sessionLost ? (
          <EmptyState icon="lock-closed-outline" title="Penugasan tidak aktif" message="Akses atau penugasan Anda sudah tidak aktif. Hubungi panitia, lalu masuk kembali." actionLabel="Keluar" onAction={() => void doSignOut()} />
        ) : null}
        {q.error && !sessionLost ? <ErrorState message={friendlyMessage(q.error)} onRetry={() => void q.refetch()} /> : null}
        {a ? (
          <>
            <HeroCard>
              <View style={styles.hero}>
                <FleetIcon iconKey={a.fleet.icon_key} size={72} />
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <AppText variant="label" color={colors.gold700}>Armada Anda</AppText>
                  <AppText variant="display">{a.fleet.name}</AppText>
                  <AppText variant="body" color={colors.inkMuted}>Kepala: {a.participant.full_name}</AppText>
                </View>
              </View>
              <StatusChip meta={tripActive ? { label: 'Perjalanan sedang berjalan', tone: 'success', icon: 'navigate-outline' } : { label: 'Perjalanan belum dimulai', tone: 'neutral', icon: 'time-outline' }} />
            </HeroCard>

            {tripActive ? (
              <PrimaryButton label="Akhiri perjalanan" icon="stop-circle-outline" danger loading={busy} onPress={() => setConfirmEnd(true)} />
            ) : (
              <PrimaryButton label="Mulai perjalanan" icon="play-circle-outline" loading={busy} onPress={() => void start()} />
            )}

            {permIssue ? (
              <PremiumCard>
                <AppText variant="bodyStrong" color={colors.danger}>{permIssue}</AppText>
                <SecondaryButton label="Buka pengaturan aplikasi" icon="settings-outline" onPress={() => void Linking.openSettings()} />
              </PremiumCard>
            ) : null}

            {tripActive ? (
              <>
                <SectionHeader title="Status GPS" />
                <PremiumCard>
                  <StatusChip meta={gps.running ? { label: 'GPS aktif', tone: 'success', icon: 'locate-outline' } : { label: 'GPS belum aktif', tone: 'warning', icon: 'warning-outline' }} />
                  <AppText variant="body">
                    {gps.lastSavedAt ? `Lokasi terakhir tersimpan di server pukul ${formatTime(new Date(gps.lastSavedAt))}.` : 'Belum ada lokasi yang terkonfirmasi tersimpan di server.'}
                  </AppText>
                  {gps.queued > 0 ? <AppText variant="body" color={colors.inkMuted}>{gps.queued} lokasi menunggu dikirim.</AppText> : null}
                  {gps.lastError ? <AppText variant="bodyStrong" color={colors.danger}>{gps.lastError}</AppText> : null}
                  {bgGranted === false ? <AppText variant="body" color={colors.inkMuted}>Izin lokasi "Selalu" belum diberikan; biarkan aplikasi tetap terbuka atau berikan izin di pengaturan agar pelacakan stabil saat layar terkunci.</AppText> : null}
                </PremiumCard>
              </>
            ) : null}

            <SectionHeader title={`Peserta armada (${a.members.length})`} />
            <PremiumCard>
              {a.members.length === 0 ? (
                <AppText variant="body" color={colors.inkMuted}>Belum ada peserta yang tercatat di armada ini.</AppText>
              ) : (
                a.members.map((m) => <AppText key={m.id} variant="body">{m.full_name}</AppText>)
              )}
            </PremiumCard>
          </>
        ) : null}
        <SecondaryButton label="Keluar" icon="log-out-outline" onPress={() => setConfirmOut(true)} />
      </ScrollView>

      <ConfirmationSheet
        visible={confirmEnd}
        title="Akhiri perjalanan?"
        message="Pelacakan GPS berhenti dan panitia tidak lagi menerima lokasi terbaru armada Anda."
        confirmLabel="Akhiri"
        danger
        loading={busy}
        onConfirm={() => void end()}
        onCancel={() => setConfirmEnd(false)}
      />
      <ConfirmationSheet
        visible={confirmOut}
        title="Keluar dari akun?"
        message={tripActive ? 'Perjalanan masih berjalan. Jika keluar, GPS berhenti dan lokasi tidak lagi dikirim sampai Anda masuk lagi.' : 'Anda perlu kode peserta dan PIN untuk masuk kembali.'}
        confirmLabel="Keluar"
        danger
        loading={signingOut}
        onConfirm={() => void doSignOut()}
        onCancel={() => setConfirmOut(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
});
