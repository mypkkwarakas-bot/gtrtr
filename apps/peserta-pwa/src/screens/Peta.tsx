import { useMemo, useRef } from 'react';
import { fetchFleetMap } from '../lib/api';
import { useAsync, useNow, useOnline } from '../lib/useAsync';
import type { EventSettings, ParticipantLookup, TrackingStatus } from '../lib/types';
import { formatAge, formatDistance } from '../lib/dates';
import { FleetMap, type MapFleet } from '../Map';
import { Empty, ErrorBox, Loading, StatusChip, busSrc } from '../ui';

export function PetaScreen({ event, who }: { event: EventSettings | null; who: ParticipantLookup | null }) {
  const res = useAsync(fetchFleetMap, 20_000);
  const online = useOnline();
  const now = useNow(5_000);
  // Usia lokasi dari server dihitung ulang di klien di antara dua pengambilan data (ambang sama dengan backend).
  const fetchedAt = useRef(0);
  if (res.updatedAt) fetchedAt.current = res.updatedAt;

  const fleets: MapFleet[] = useMemo(() => {
    if (!res.data || res.data.disabled) return [];
    const { map } = res.data;
    return map.fleets.map((f) => {
      const elapsed = Math.max(0, Math.floor((now - fetchedAt.current) / 1000));
      const liveAge = f.age_seconds === null ? null : f.age_seconds + elapsed;
      let st: TrackingStatus = f.status;
      if (f.status === 'fresh' || f.status === 'late' || f.status === 'stale') {
        if (liveAge === null) st = 'stale';
        else st = liveAge <= map.thresholds.late_after_seconds ? 'fresh' : liveAge <= map.thresholds.stale_after_seconds ? 'late' : 'stale';
      }
      return { ...f, liveStatus: st, liveAge };
    });
  }, [res.data, now]);

  const dest = event && event.destination_lat !== null && event.destination_lng !== null
    ? { name: event.destination_name, lat: event.destination_lat, lng: event.destination_lng } : null;

  const disabled = res.data?.disabled === true;

  return (
    <>
      <div className="page-title"><h1>Peta</h1>
        <button className="btn secondary small" onClick={res.reload} disabled={res.refreshing || !online}>{res.refreshing ? 'Memuat…' : 'Segarkan'}</button>
      </div>
      {res.loading ? <Loading label="Memuat peta…" />
        : res.error && !res.data ? <ErrorBox message={res.error} onRetry={res.reload} />
        : disabled ? <Empty title="Peta armada sedang disembunyikan" text="Panitia belum menampilkan posisi armada untuk peserta. Destinasi tetap bisa dilihat di Beranda." />
        : (
          <>
            {res.error && <p className="field-error" role="status">Gagal memperbarui: {res.error}. Menampilkan data terakhir.</p>}
            <FleetMap fleets={fleets} destination={dest} myFleetId={who?.fleet?.id ?? null} />
            <p className="muted small-text">
              Posisi berasal dari perangkat kepala rombongan, bukan dari ponsel Anda. Diperbarui otomatis tiap 20 detik{res.updatedAt ? ` · terakhir dimuat ${formatAge(Math.floor((now - res.updatedAt) / 1000))}` : ''}.
            </p>
            {!dest && <p className="muted small-text">Destinasi belum ditetapkan panitia.</p>}
            {fleets.length === 0 ? <Empty title="Belum ada armada aktif" />
              : (
                <ul className="list">
                  {fleets.map((f) => {
                    const img = busSrc(f.icon_key);
                    const dist = formatDistance(f.distance_to_destination_m);
                    const mine = f.fleet_id === who?.fleet?.id;
                    return (
                      <li key={f.fleet_id} className={`card fleet-row${mine ? ' is-mine' : ''}`}>
                        {img ? <img src={img} alt="" width={64} height={44} loading="lazy" /> : <div className="img-ph" aria-hidden>🚌</div>}
                        <div className="fr-main">
                          <strong>{f.fleet_name}{mine && <span className="badge official">Armada Anda</span>}</strong>
                          <StatusChip status={f.liveStatus} />
                          <div className="muted">
                            {f.latitude === null ? 'Belum ada lokasi dari kepala rombongan.'
                              : `Lokasi diperbarui ${formatAge(f.liveAge)}${dist ? ` · ${dist} ke destinasi` : ''}`}
                          </div>
                          {f.liveStatus === 'stale' && f.trip_active && <div className="muted">Posisi di peta sudah lama dan mungkin tidak akurat.</div>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
          </>
        )}
    </>
  );
}
