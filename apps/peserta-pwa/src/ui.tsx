import type { ReactNode } from 'react';
import type { TrackingStatus } from './lib/types';

export function Loading({ label = 'Memuat…' }: { label?: string }) {
  return <div className="state" role="status"><div className="spinner" aria-hidden />{label}</div>;
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return <div className="state empty"><strong>{title}</strong>{text && <p>{text}</p>}</div>;
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state error" role="alert">
      <strong>Data tidak dapat dimuat</strong>
      <p>{message}</p>
      {onRetry && <button className="btn secondary" onClick={onRetry}>Coba lagi</button>}
    </div>
  );
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="section">
      <div className="section-head"><h2>{title}</h2>{aside}</div>
      {children}
    </section>
  );
}

const STATUS: Record<TrackingStatus, { label: string; cls: string; icon: string }> = {
  fresh: { label: 'Lokasi terkini', cls: 'ok', icon: '●' },
  late: { label: 'Lokasi tertunda', cls: 'warn', icon: '◐' },
  stale: { label: 'Lokasi lama', cls: 'bad', icon: '!' },
  trip_ended: { label: 'Perjalanan berakhir', cls: 'neutral', icon: '⚑' },
  no_location: { label: 'Belum ada lokasi', cls: 'neutral', icon: '○' },
};

export function StatusChip({ status }: { status: TrackingStatus }) {
  const s = STATUS[status];
  return <span className={`chip ${s.cls}`}><span aria-hidden>{s.icon}</span> {s.label}</span>;
}

export function busSrc(iconKey: string | null): string | null {
  return iconKey && /^bus-[1-8]$/.test(iconKey) ? `/buses/${iconKey}.png` : null;
}
