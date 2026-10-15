import type { AsyncState } from '../lib/useAsync';
import { useNow } from '../lib/useAsync';
import type { Announcement, EventSettings, ParticipantLookup, Schedule } from '../lib/types';
import { countdownParts, eventStart, formatDateLong, formatDateTime, formatTime } from '../lib/dates';
import { Empty, ErrorBox, Loading, Section } from '../ui';

interface Props {
  event: AsyncState<EventSettings | null>;
  announcements: AsyncState<Announcement[]>;
  schedules: AsyncState<Schedule[]>;
  who: ParticipantLookup | null;
  go: (t: 'beranda' | 'peta' | 'jadwal' | 'info') => void;
}

function Countdown({ target, label }: { target: Date; label: string }) {
  const now = useNow();
  const ms = target.getTime() - now;
  if (ms <= 0) return null;
  const c = countdownParts(ms);
  return (
    <div className="countdown" role="timer" aria-label={`${label}: ${c.d} hari ${c.h} jam ${c.m} menit`}>
      <div className="cd-label">{label}</div>
      <div className="cd-row">
        {[['Hari', c.d], ['Jam', c.h], ['Menit', c.m], ['Detik', c.s]].map(([l, v]) => (
          <div key={l as string} className="cd-cell"><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>
        ))}
      </div>
    </div>
  );
}

export function Beranda({ event, announcements, schedules, who, go }: Props) {
  const ev = event.data;
  const now = Date.now();
  const next = (schedules.data ?? []).find((s) => new Date(s.starts_at).getTime() > now) ?? null;
  const evStart = ev ? eventStart(ev.event_date, ev.start_time) : null;
  const target = next ? { at: new Date(next.starts_at), label: `Menuju: ${next.title}` }
    : evStart && evStart.getTime() > now ? { at: evStart, label: 'Menuju hari acara' } : null;

  return (
    <>
      <header className="hero">
        <p className="eyebrow">KLKM Jakarta Utara</p>
        <h1>{ev?.event_name || 'Family Gathering'}</h1>
        {ev?.event_date && <p className="hero-date">{formatDateLong(ev.event_date + 'T12:00:00+07:00')}{ev.start_time ? ` · ${ev.start_time.slice(0, 5).replace(':', '.')} WIB` : ''}</p>}
        {ev?.description && <p className="hero-desc">{ev.description}</p>}
        {target && <Countdown target={target.at} label={target.label} />}
        {event.loading && <Loading />}
        {event.error && !ev && <ErrorBox message={event.error} onRetry={event.reload} />}
      </header>

      {who && (
        <div className="card mine">
          <div className="muted">Halo, {who.full_name}</div>
          {who.fleet
            ? <div><span className="badge official">Armada resmi</span> <strong>{who.fleet.name}</strong></div>
            : who.requested_fleet
              ? <div><span className="badge pending">Pilihan Anda</span> <strong>{who.requested_fleet.name}</strong> <span className="muted">· menunggu penetapan panitia</span></div>
              : <div className="muted">Armada Anda belum ditetapkan panitia. <button className="link-btn" onClick={() => go('info')}>Ajukan pilihan armada</button></div>}
        </div>
      )}

      <Section title="Pengumuman" aside={<button className="link-btn" onClick={() => go('info')}>Semua</button>}>
        {announcements.loading ? <Loading />
          : announcements.error && !announcements.data ? <ErrorBox message={announcements.error} onRetry={announcements.reload} />
          : !announcements.data?.length ? <Empty title="Belum ada pengumuman" text="Pengumuman dari panitia akan muncul di sini." />
          : (
            <>
              <Ticker items={announcements.data} />
              <ul className="list">
                {announcements.data.slice(0, 3).map((a) => (
                  <li key={a.id} className="card">
                    {a.title && <strong>{a.title}</strong>}
                    <p className="pre">{a.body}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
      </Section>

      <Section title="Acara berikutnya" aside={<button className="link-btn" onClick={() => go('jadwal')}>Jadwal</button>}>
        {schedules.loading ? <Loading />
          : schedules.error && !schedules.data ? <ErrorBox message={schedules.error} onRetry={schedules.reload} />
          : !next ? <Empty title="Tidak ada acara mendatang" text="Jadwal yang sudah dipublikasikan akan tampil di sini." />
          : (
            <div className="card next">
              <strong>{next.title}</strong>
              <div className="muted">{formatDateTime(next.starts_at)}{next.ends_at ? ` – ${formatTime(next.ends_at)}` : ''}</div>
              {next.location && <div>📍 {next.location}</div>}
              {next.description && <p className="pre">{next.description}</p>}
            </div>
          )}
      </Section>

      <Section title="Destinasi" aside={<button className="link-btn" onClick={() => go('peta')}>Lihat peta</button>}>
        {event.loading ? <Loading />
          : ev?.destination_name || ev?.destination_address
            ? <div className="card"><strong>{ev.destination_name}</strong>{ev.destination_address && <div className="muted">{ev.destination_address}</div>}</div>
            : <Empty title="Destinasi belum ditetapkan" />}
      </Section>
    </>
  );
}

/** Ticker pengumuman. Berhenti bergerak untuk pengguna yang memilih "kurangi gerakan" atau saat disentuh/di-fokus; isi lengkap selalu ada di daftar di bawahnya. */
function Ticker({ items }: { items: Announcement[] }) {
  const text = items.map((a) => (a.title ? `${a.title}: ${a.body}` : a.body).replace(/\s+/g, ' ')).join('   •   ');
  const speed = Math.max(25, text.length * 0.25); // detik; lambat agar terbaca
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
        <span>{text}</span><span>{text}</span>
      </div>
    </div>
  );
}
