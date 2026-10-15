import type { AsyncState } from '../lib/useAsync';
import { useNow } from '../lib/useAsync';
import type { Schedule } from '../lib/types';
import { dayKey, formatDateLong, formatTime } from '../lib/dates';
import { Empty, ErrorBox, Loading } from '../ui';

export function Jadwal({ schedules }: { schedules: AsyncState<Schedule[]> }) {
  const now = useNow(30_000);
  const { data, loading, error, reload, refreshing } = schedules;

  const groups = new Map<string, Schedule[]>();
  for (const s of data ?? []) {
    const k = dayKey(s.starts_at);
    groups.set(k, [...(groups.get(k) ?? []), s]);
  }
  const nextId = (data ?? []).find((s) => new Date(s.starts_at).getTime() > now)?.id;

  return (
    <>
      <div className="page-title"><h1>Jadwal</h1>{refreshing && <span className="muted">memperbarui…</span>}</div>
      {loading ? <Loading />
        : error && !data ? <ErrorBox message={error} onRetry={reload} />
        : !data?.length ? <Empty title="Belum ada jadwal" text="Panitia belum mempublikasikan jadwal acara." />
        : (
          <>
            {error && <p className="field-error" role="status">Gagal memperbarui: {error}</p>}
            {[...groups.entries()].map(([k, items]) => (
              <section key={k} className="day">
                <h2>{formatDateLong(items[0].starts_at)}</h2>
                <ol className="timeline">
                  {items.map((s) => {
                    const started = new Date(s.starts_at).getTime() <= now;
                    const ended = s.ends_at ? new Date(s.ends_at).getTime() <= now : false;
                    const state = ended ? 'done' : started ? 'live' : s.id === nextId ? 'next' : '';
                    return (
                      <li key={s.id} className={`tl-item ${state}`}>
                        <div className="tl-time">{formatTime(s.starts_at)}{s.ends_at ? <small>s/d {formatTime(s.ends_at)}</small> : null}</div>
                        <div className="tl-body card">
                          {state === 'next' && <span className="badge pending">Berikutnya</span>}
                          {state === 'live' && !ended && <span className="badge official">Berlangsung</span>}
                          <strong>{s.title}</strong>
                          {s.location && <div className="muted">📍 {s.location}</div>}
                          {s.description && <p className="pre">{s.description}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </>
        )}
    </>
  );
}
