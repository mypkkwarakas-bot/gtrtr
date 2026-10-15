// Acara di Jakarta (WIB, UTC+7, tanpa DST). Semua tampilan memakai WIB agar konsisten di semua perangkat.
const OFFSET = 7 * 3600 * 1000;
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const pad = (n: number) => String(n).padStart(2, '0');

function parts(input: Date | string | number) {
  const x = new Date(new Date(input).getTime() + OFFSET);
  return { y: x.getUTCFullYear(), m: x.getUTCMonth(), d: x.getUTCDate(), h: x.getUTCHours(), mi: x.getUTCMinutes(), dow: x.getUTCDay() };
}

export const formatTime = (i: Date | string) => { const p = parts(i); return `${pad(p.h)}.${pad(p.mi)}`; };
export const formatDateLong = (i: Date | string) => { const p = parts(i); return `${DAYS[p.dow]}, ${p.d} ${MONTHS[p.m]} ${p.y}`; };
export const formatDateTime = (i: Date | string) => { const p = parts(i); return `${p.d} ${MONTHS[p.m]} ${p.y}, ${pad(p.h)}.${pad(p.mi)} WIB`; };
export const dayKey = (i: Date | string) => { const p = parts(i); return `${p.y}-${pad(p.m + 1)}-${pad(p.d)}`; };

/** event_date (YYYY-MM-DD) + start_time (HH:MM[:SS]) dalam WIB -> Date; null bila salah satu tidak ada/tidak valid. */
export function eventStart(date: string | null, time: string | null): Date | null {
  if (!date) return null;
  const t = (time ?? '00:00:00').slice(0, 8);
  const d = new Date(`${date}T${t.length === 5 ? t + ':00' : t}+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatAge(seconds: number | null): string {
  if (seconds === null || seconds < 0) return 'belum ada data';
  if (seconds < 10) return 'baru saja';
  if (seconds < 60) return `${seconds} detik lalu`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} jam lalu` : `${Math.floor(h / 24)} hari lalu`;
}

export function countdownParts(ms: number): { d: number; h: number; m: number; s: number } {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

export function formatDistance(m: number | null): string | null {
  if (m === null) return null;
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
