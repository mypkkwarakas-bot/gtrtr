/**
 * Utilitas tanggal/waktu. Acara berlangsung di Jakarta (WIB, UTC+7, tanpa DST), sehingga semua
 * tampilan memakai WIB secara tetap agar konsisten di perangkat dengan zona waktu berbeda.
 * Backend menyimpan timestamptz (UTC); konversi dilakukan di sini.
 */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export interface WibParts {
  y: number;
  m: number; // 0-11
  d: number;
  h: number;
  mi: number;
  dow: number;
}

export function wibParts(input: Date | string | number): WibParts {
  const t = new Date(input).getTime() + WIB_OFFSET_MS;
  const x = new Date(t);
  return {
    y: x.getUTCFullYear(),
    m: x.getUTCMonth(),
    d: x.getUTCDate(),
    h: x.getUTCHours(),
    mi: x.getUTCMinutes(),
    dow: x.getUTCDay(),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(input: Date | string): string {
  const p = wibParts(input);
  return `${pad(p.h)}:${pad(p.mi)}`;
}

export function formatDateShort(input: Date | string): string {
  const p = wibParts(input);
  return `${p.d} ${MONTHS[p.m]} ${p.y}`;
}

export function formatDateLong(input: Date | string): string {
  const p = wibParts(input);
  return `${DAYS[p.dow]}, ${p.d} ${MONTHS[p.m]} ${p.y}`;
}

export function formatDateTime(input: Date | string): string {
  return `${formatDateShort(input)} · ${formatTime(input)} WIB`;
}

/** Kunci hari (YYYY-MM-DD) dalam WIB, untuk pengelompokan agenda. */
export function wibDayKey(input: Date | string): string {
  const p = wibParts(input);
  return `${p.y}-${pad(p.m + 1)}-${pad(p.d)}`;
}

export function wibToISO(y: number, m: number, d: number, h: number, mi: number): string {
  return new Date(Date.UTC(y, m, d, h, mi) - WIB_OFFSET_MS).toISOString();
}

/** Date lokal yang komponennya sama dengan komponen WIB dari `iso` (untuk nilai awal date picker). */
export function toPickerDate(iso: string | null | undefined): Date {
  if (!iso) return new Date();
  const p = wibParts(iso);
  return new Date(p.y, p.m, p.d, p.h, p.mi, 0, 0);
}

/** Kebalikan toPickerDate: komponen lokal hasil picker dianggap WIB. */
export function fromPickerDate(dt: Date): string {
  return wibToISO(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
}

/** event_settings.event_date ('YYYY-MM-DD') + start_time ('HH:MM[:SS]') dalam WIB -> Date */
export function eventDateTime(date: string | null, time: string | null): Date | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map((v) => parseInt(v, 10));
  if (![y, m, d].every(Number.isFinite)) return null;
  const [hh, mm] = (time ?? '00:00').split(':').map((v) => parseInt(v, 10));
  return new Date(wibToISO(y, m - 1, d, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0));
}

export function formatClockInput(time: string | null): string {
  if (!time) return '';
  return time.slice(0, 5);
}

/** "baru saja", "2 menit lalu", "1 jam 5 menit lalu" */
export function relativeAge(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return 'belum ada data';
  const s = Math.max(0, Math.floor(seconds));
  if (s < 10) return 'baru saja';
  if (s < 60) return `${s} detik lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return rm > 0 ? `${h} jam ${rm} menit lalu` : `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export function secondsSince(iso: string | null | undefined, now: number = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((now - t) / 1000));
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} j ${pad(m)} m`;
  if (m > 0) return `${m} menit`;
  return `${s} detik`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null || !Number.isFinite(meters)) return '-';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Hitung-mundur menuju waktu target: "H-3", "Hari ini", "Berlangsung" */
export function countdownLabel(target: Date | null, now: number = Date.now()): string | null {
  if (!target) return null;
  const diff = target.getTime() - now;
  if (diff <= 0) return 'Sudah dimulai';
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return `H-${days}`;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours} jam lagi`;
  return `${Math.max(1, Math.floor(diff / 60000))} menit lagi`;
}
