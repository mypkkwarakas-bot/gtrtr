import { useEffect, useState } from 'react';
import type { AsyncState } from '../lib/useAsync';
import { ApiError, fetchFleets, lookupParticipant, requestFleet } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import type { Announcement, EventSettings, ParticipantLookup } from '../lib/types';
import { Empty, ErrorBox, Loading, Section } from '../ui';

interface Props {
  event: AsyncState<EventSettings | null>;
  announcements: AsyncState<Announcement[]>;
  who: ParticipantLookup | null;
  onWho: (p: ParticipantLookup) => void;
  onLogout: () => void;
  onLogin: () => void;
}

export function Info({ event, announcements, who, onWho, onLogout, onLogin }: Props) {
  const ev = event.data;
  return (
    <>
      <div className="page-title"><h1>Info</h1></div>

      <Section title="Peserta & armada">
        {who ? <FleetPanel who={who} onWho={onWho} onLogout={onLogout} />
          : <div className="card"><p>Anda melihat informasi tanpa kode peserta.</p><button className="btn primary" onClick={onLogin}>Masukkan kode peserta</button></div>}
      </Section>

      <Section title="Semua pengumuman">
        {announcements.loading ? <Loading />
          : announcements.error && !announcements.data ? <ErrorBox message={announcements.error} onRetry={announcements.reload} />
          : !announcements.data?.length ? <Empty title="Belum ada pengumuman" />
          : <ul className="list">{announcements.data.map((a) => (
              <li key={a.id} className="card">{a.title && <strong>{a.title}</strong>}<p className="pre">{a.body}</p></li>
            ))}</ul>}
      </Section>

      <Section title="Informasi kegiatan">
        {event.loading ? <Loading />
          : event.error && !ev ? <ErrorBox message={event.error} onRetry={event.reload} />
          : ev && (ev.general_info || ev.contact_info)
            ? <div className="card">
                {ev.general_info && <p className="pre">{ev.general_info}</p>}
                {ev.contact_info && <><strong>Kontak panitia</strong><p className="pre">{ev.contact_info}</p></>}
              </div>
            : <Empty title="Belum ada informasi" text="Panitia belum menambahkan informasi umum atau kontak." />}
      </Section>
    </>
  );
}

function FleetPanel({ who, onWho, onLogout }: { who: ParticipantLookup; onWho: (p: ParticipantLookup) => void; onLogout: () => void }) {
  const fleets = useAsync(fetchFleets);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { setChoice(who.requested_fleet?.id ?? ''); }, [who.requested_fleet?.id]);

  async function submit() {
    if (!choice) return;
    setBusy(true); setMsg(null);
    try {
      const text = await requestFleet(who.code, choice); // sukses hanya bila backend ok=true
      onWho(await lookupParticipant(who.code));           // tampilkan keadaan sebenarnya dari server
      setMsg({ ok: true, text });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError || e instanceof Error ? e.message : 'Permintaan gagal.' });
    } finally { setBusy(false); }
  }

  return (
    <div className="card">
      <div><strong>{who.full_name}</strong> <span className="muted">· {who.code}</span></div>
      {who.fleet ? (
        <p><span className="badge official">Armada resmi</span> <strong>{who.fleet.name}</strong><br />
          <span className="muted">Ditetapkan panitia. Perubahan hanya dapat dilakukan panitia.</span></p>
      ) : (
        <>
          <p className="muted">Armada resmi Anda belum ditetapkan panitia.
            {who.requested_fleet && <> Pilihan Anda saat ini: <strong>{who.requested_fleet.name}</strong> (belum disetujui).</>}</p>
          {fleets.loading ? <Loading />
            : fleets.error && !fleets.data ? <ErrorBox message={fleets.error} onRetry={fleets.reload} />
            : !fleets.data?.length ? <Empty title="Belum ada armada" />
            : (
              <>
                <label htmlFor="fleet">Ajukan pilihan armada</label>
                <select id="fleet" value={choice} onChange={(e) => setChoice(e.target.value)} disabled={busy}>
                  <option value="">Pilih armada…</option>
                  {fleets.data.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button className="btn primary" onClick={() => void submit()} disabled={busy || !choice || choice === who.requested_fleet?.id}>
                  {busy ? 'Mengirim…' : 'Kirim pilihan'}
                </button>
              </>
            )}
        </>
      )}
      {msg && <p className={msg.ok ? 'field-ok' : 'field-error'} role="status">{msg.text}</p>}
      <button className="btn link" onClick={onLogout}>Ganti kode peserta / keluar</button>
    </div>
  );
}
