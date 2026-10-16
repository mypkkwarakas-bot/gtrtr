import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppHeader, AppText, colors, ConfirmationSheet, ErrorState, FleetIcon, formatDistance, formatDateTime, friendlyMessage, HeroCard, IconButton, LoadingState,
  PremiumCard, PrimaryButton, radius, relativeAge, SearchField, SecondaryButton, SectionHeader, spacing, StatusChip, trackingStatusMeta, useToast, validatePin,
  FormField, HIT,
} from '@fg/shared';
import { fetchFleets, FLEETS_KEY } from '../../../src/admin/fleets';
import { fetchParticipants, PARTICIPANTS_KEY } from '../../../src/admin/participants';
import { assignLeader, fetchFleetDetail, fetchLeaders, fleetDetailKey, LEADERS_KEY, requestLocation, setLeaderAccess, setLeaderPin, unassignLeader } from '../../../src/admin/leaders';

type Dialog = null | 'unassign' | 'pin' | 'access_off';

export default function FleetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const fleets = useQuery({ queryKey: FLEETS_KEY, queryFn: fetchFleets });
  const detail = useQuery({ queryKey: fleetDetailKey(id), queryFn: () => fetchFleetDetail(id), enabled: !!id });
  const leaders = useQuery({ queryKey: LEADERS_KEY, queryFn: fetchLeaders });
  const fleet = fleets.data?.find((f) => f.id === id);
  const leaderRow = leaders.data?.find((l) => l.fleet_id === id);

  const [picker, setPicker] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | undefined>();
  const [issuedPin, setIssuedPin] = useState<{ pin: string; code: string } | null>(null);

  const refreshAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: fleetDetailKey(id) }),
      qc.invalidateQueries({ queryKey: LEADERS_KEY }),
      qc.invalidateQueries({ queryKey: PARTICIPANTS_KEY }),
      qc.invalidateQueries({ queryKey: ['admin_dashboard'] }),
    ]);
  };
  const onErr = (e: unknown) => toast('error', friendlyMessage(e));

  const assign = useMutation({ mutationFn: (pid: string) => assignLeader(id, pid), onSuccess: async () => { setPicker(false); await refreshAll(); toast('success', 'Kepala rombongan ditetapkan.'); }, onError: onErr });
  const unassign = useMutation({ mutationFn: () => unassignLeader(id), onSuccess: async () => { setDialog(null); await refreshAll(); toast('success', 'Penugasan kepala rombongan dicabut.'); }, onError: (e) => { setDialog(null); onErr(e); } });
  const pin = useMutation({
    mutationFn: (manual?: string) => setLeaderPin(leaderRow!.participant_id, manual),
    onSuccess: async (data) => { setDialog(null); setPinInput(''); setIssuedPin(data); await refreshAll(); },
    onError: (e) => { setDialog(null); onErr(e); },
  });
  const access = useMutation({ mutationFn: (enabled: boolean) => setLeaderAccess(leaderRow!.participant_id, enabled), onSuccess: async (_d, enabled) => { setDialog(null); await refreshAll(); toast('success', enabled ? 'Akses diaktifkan.' : 'Akses dinonaktifkan.'); }, onError: (e) => { setDialog(null); onErr(e); } });
  const locReq = useMutation({
    mutationFn: () => requestLocation(id),
    onSuccess: async (env) => {
      await refreshAll();
      if (!env.ok) toast('error', env.message ?? 'Permintaan gagal.');
      else toast(env.code === 'ALREADY_PENDING' ? 'info' : 'success', env.message ?? 'Permintaan dikirim.');
    },
    onError: onErr,
  });

  if (detail.isLoading || fleets.isLoading) return <LoadingState />;
  const d = detail.data;
  if (detail.isError || !d || !fleet) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader title="Armada" onBack={() => router.back()} />
        <ErrorState message={friendlyMessage(detail.error ?? fleets.error)} onRetry={() => { void detail.refetch(); void fleets.refetch(); }} />
      </View>
    );
  }
  const meta = trackingStatusMeta(d.status);
  const hasLeader = !!leaderRow;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={fleet.name} subtitle={fleet.is_active ? 'Armada aktif' : 'Armada nonaktif'} onBack={() => router.back()} right={<IconButton icon="create-outline" label="Ubah armada" onPress={() => router.push({ pathname: '/admin/armada/form', params: { id } })} />} />
      <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={detail.isRefetching} onRefresh={() => void refreshAll()} tintColor={colors.emerald600} />}>
        <HeroCard style={styles.hero}>
          <FleetIcon iconKey={fleet.icon_key} size={72} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="h2" color={colors.white}>{fleet.name}</AppText>
            <AppText variant="body" color={colors.emerald100}>{d.fleet.member_count} peserta aktif</AppText>
            <StatusChip meta={meta} />
          </View>
        </HeroCard>

        <SectionHeader title="Lokasi" />
        <PremiumCard style={{ gap: spacing.xs }}>
          {d.location ? (
            <>
              <AppText variant="bodyStrong">Kontak terakhir {relativeAge(d.location.age_seconds)}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>Posisi direkam {formatDateTime(d.location.recorded_at)}</AppText>
            </>
          ) : <AppText variant="body" color={colors.inkMuted}>Lokasi belum pernah diterima dari perangkat kepala rombongan.</AppText>}
          {d.destination?.distance_m != null ? <AppText variant="caption" color={colors.inkMuted}>Jarak ke tujuan {formatDistance(d.destination.distance_m)}</AppText> : null}
          {d.last_request ? <AppText variant="caption" color={colors.inkMuted}>Permintaan lokasi terakhir: {d.last_request.status} · {formatDateTime(d.last_request.requested_at)}</AppText> : null}
          <SecondaryButton label="Minta lokasi terbaru" icon="locate-outline" onPress={() => locReq.mutate()} loading={locReq.isPending} style={{ marginTop: spacing.sm }} />
          <AppText variant="caption" color={colors.inkMuted}>Mengirim permintaan ke backend. Perangkat menjawab bila aplikasi kepala rombongan sedang aktif dalam perjalanan; tidak ada jaminan langsung terkirim.</AppText>
        </PremiumCard>

        <SectionHeader title="Kepala rombongan" />
        <PremiumCard style={{ gap: spacing.md }}>
          {hasLeader ? (
            <>
              <AppText variant="h3">{d.fleet.leader_name ?? 'Kepala rombongan'}</AppText>
              <PrimaryButton label="Atur PIN" icon="key-outline" onPress={() => { setPinInput(''); setPinError(undefined); setDialog('pin'); }} />
              <SecondaryButton label="Nonaktifkan akses" icon="lock-closed-outline" onPress={() => setDialog('access_off')} />
              <SecondaryButton label="Aktifkan akses" icon="lock-open-outline" onPress={() => access.mutate(true)} loading={access.isPending} />
              <SecondaryButton label="Ganti kepala rombongan" icon="swap-horizontal-outline" onPress={() => setPicker(true)} />
              <SecondaryButton label="Cabut penugasan" icon="person-remove-outline" danger onPress={() => setDialog('unassign')} />
            </>
          ) : (
            <>
              <AppText variant="body" color={colors.inkMuted}>Armada ini belum memiliki kepala rombongan.</AppText>
              <PrimaryButton label="Tetapkan kepala rombongan" icon="person-add-outline" onPress={() => setPicker(true)} disabled={!fleet.is_active} />
            </>
          )}
          <AppText variant="caption" color={colors.inkMuted}>Status PIN/akses tidak dapat ditampilkan karena backend tidak mengizinkan Admin membacanya.</AppText>
        </PremiumCard>

        {d.trip ? (
          <>
            <SectionHeader title="Perjalanan" />
            <PremiumCard style={{ gap: spacing.xs }}>
              <AppText variant="bodyStrong">{d.trip.status === 'active' ? 'Sedang berjalan' : 'Telah berakhir'}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>Mulai {formatDateTime(d.trip.started_at)}{d.trip.ended_at ? ` · selesai ${formatDateTime(d.trip.ended_at)}` : ''}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>Jarak tempuh {formatDistance(d.trip.distance_m)}</AppText>
            </PremiumCard>
          </>
        ) : null}
      </ScrollView>

      <LeaderPicker visible={picker} fleetId={id} currentParticipantId={leaderRow?.participant_id} busy={assign.isPending} onClose={() => setPicker(false)} onPick={(pid) => assign.mutate(pid)} />

      <ConfirmationSheet visible={dialog === 'unassign'} title="Cabut penugasan?" message="Perjalanan yang sedang berjalan akan diakhiri, PIN kepala rombongan dihapus, dan ia tidak dapat masuk lagi sampai ditugaskan ulang." confirmLabel="Cabut penugasan" danger loading={unassign.isPending} onCancel={() => setDialog(null)} onConfirm={() => unassign.mutate()} />
      <ConfirmationSheet visible={dialog === 'access_off'} title="Nonaktifkan akses?" message="Perjalanan yang sedang berjalan akan diakhiri dan kepala rombongan tidak dapat masuk sampai akses diaktifkan kembali." confirmLabel="Nonaktifkan" danger loading={access.isPending} onCancel={() => setDialog(null)} onConfirm={() => access.mutate(false)} />

      <Modal visible={dialog === 'pin'} transparent animationType="fade" onRequestClose={() => !pin.isPending && setDialog(null)} statusBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => !pin.isPending && setDialog(null)} />
        <View style={styles.sheet}>
          <AppText variant="h2">Atur PIN kepala rombongan</AppText>
          <AppText variant="body" color={colors.inkSoft}>PIN lama tidak berlaku lagi setelah ini. Biarkan kosong agar sistem membuat PIN acak 6 digit.</AppText>
          <FormField label="PIN (opsional, 6–12 digit)" value={pinInput} onChangeText={(t) => setPinInput(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={12} error={pinError} secureTextEntry />
          <PrimaryButton label={pinInput ? 'Simpan PIN' : 'Buat PIN acak'} onPress={() => { const err = pinInput ? validatePin(pinInput) : undefined; setPinError(err); if (!err) pin.mutate(pinInput || undefined); }} loading={pin.isPending} />
          <SecondaryButton label="Batal" onPress={() => setDialog(null)} disabled={pin.isPending} />
        </View>
      </Modal>

      <Modal visible={issuedPin !== null} transparent animationType="fade" onRequestClose={() => setIssuedPin(null)} statusBarTranslucent>
        <Pressable style={styles.scrim} />
        <View style={styles.sheet}>
          <AppText variant="h2">PIN tersimpan</AppText>
          <AppText variant="body" color={colors.inkSoft}>Catat sekarang dan sampaikan ke kepala rombongan. PIN hanya ditampilkan sekali ini.</AppText>
          <PremiumCard style={{ alignItems: 'center', gap: spacing.xs }}>
            <AppText variant="caption" color={colors.inkMuted}>Kode peserta</AppText>
            <AppText variant="stat" selectable>{issuedPin?.code}</AppText>
            <AppText variant="caption" color={colors.inkMuted}>PIN</AppText>
            <AppText variant="statLarge" selectable>{issuedPin?.pin}</AppText>
          </PremiumCard>
          <PrimaryButton label="Sudah dicatat" onPress={() => setIssuedPin(null)} />
        </View>
      </Modal>
    </View>
  );
}

function LeaderPicker({ visible, fleetId, currentParticipantId, busy, onClose, onPick }: { visible: boolean; fleetId: string; currentParticipantId?: string; busy: boolean; onClose: () => void; onPick: (participantId: string) => void }) {
  const [search, setSearch] = useState('');
  const pq = useQuery({ queryKey: PARTICIPANTS_KEY, queryFn: fetchParticipants, enabled: visible });
  const lq = useQuery({ queryKey: LEADERS_KEY, queryFn: fetchLeaders, enabled: visible });
  const otherLeaders = useMemo(() => new Set((lq.data ?? []).filter((l) => l.fleet_id !== fleetId).map((l) => l.participant_id)), [lq.data, fleetId]);
  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (pq.data ?? []).filter((p) => p.is_active && p.id !== currentParticipantId && (p.fleet_id === null || p.fleet_id === fleetId) && !otherLeaders.has(p.id) && (!s || p.full_name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s)));
  }, [pq.data, search, otherLeaders, currentParticipantId, fleetId]);
  const [chosen, setChosen] = useState<string | null>(null);
  const chosenRow = rows.find((p) => p.id === chosen);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.ivory }}>
        <AppHeader title="Pilih kepala rombongan" subtitle="Peserta aktif tanpa armada atau di armada ini" onBack={onClose} />
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md, flex: 1 }}>
          <SearchField value={search} onChangeText={setSearch} placeholder="Cari nama atau kode" />
          {pq.isLoading ? <LoadingState /> : pq.isError ? <ErrorState message={friendlyMessage(pq.error)} onRetry={() => void pq.refetch()} /> : (
            <FlatList data={rows} keyExtractor={(p) => p.id} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }} ListEmptyComponent={<AppText variant="body" color={colors.inkMuted} style={{ padding: spacing.xl, textAlign: 'center' }}>Tidak ada peserta yang memenuhi syarat.</AppText>}
              renderItem={({ item }) => (
                <Pressable onPress={() => setChosen(item.id)} accessibilityRole="radio" accessibilityState={{ selected: chosen === item.id }}>
                  <PremiumCard style={[styles.pick, chosen === item.id && { borderColor: colors.emerald600, borderWidth: 1.5, backgroundColor: colors.emerald50 }]}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="h3">{item.full_name}</AppText>
                      <AppText variant="caption" color={colors.inkMuted}>Kode {item.code}</AppText>
                    </View>
                  </PremiumCard>
                </Pressable>
              )} />
          )}
          <View style={{ paddingBottom: spacing.xl, gap: spacing.sm }}>
            {chosenRow ? <AppText variant="bodyStrong">Dipilih: {chosenRow.full_name} (kode {chosenRow.code})</AppText> : null}
            <PrimaryButton label="Tetapkan" icon="checkmark" onPress={() => chosen && onPick(chosen)} loading={busy} disabled={!chosenRow} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.giant },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ivory, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  pick: { flexDirection: 'row', alignItems: 'center', minHeight: HIT },
});
