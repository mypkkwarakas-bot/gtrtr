/** Validasi input form. Mengembalikan pesan error (Bahasa Indonesia) atau undefined bila valid. */

export function validateRequired(value: string, label: string): string | undefined {
  return value.trim().length === 0 ? `${label} wajib diisi` : undefined;
}

export function validateMaxLength(value: string, max: number, label: string): string | undefined {
  return value.trim().length > max ? `${label} maksimal ${max} karakter` : undefined;
}

/** participants.code: huruf besar, 4-20 karakter (constraint CHECK di database). */
export function validateParticipantCode(value: string): string | undefined {
  const v = value.trim();
  if (v.length === 0) return undefined; // kosong = dibuat otomatis oleh backend
  if (v.length < 4 || v.length > 20) return 'Kode peserta 4-20 karakter';
  if (!/^[A-Za-z0-9]+$/.test(v)) return 'Kode hanya boleh huruf dan angka';
  return undefined;
}

/** PIN kepala rombongan: 6-12 digit angka (aturan admin_set_leader_pin). */
export function validatePin(value: string): string | undefined {
  if (!/^[0-9]{6,12}$/.test(value)) return 'PIN harus 6-12 digit angka';
  return undefined;
}

export function validateLatitude(value: string): string | undefined {
  const n = Number(value.replace(',', '.'));
  if (value.trim() === '' || !Number.isFinite(n)) return 'Latitude harus berupa angka';
  if (n < -90 || n > 90) return 'Latitude harus antara -90 dan 90';
  return undefined;
}

export function validateLongitude(value: string): string | undefined {
  const n = Number(value.replace(',', '.'));
  if (value.trim() === '' || !Number.isFinite(n)) return 'Longitude harus berupa angka';
  if (n < -180 || n > 180) return 'Longitude harus antara -180 dan 180';
  return undefined;
}

export function validatePositiveInt(value: string, label: string, min = 1): string | undefined {
  if (!/^[0-9]+$/.test(value.trim())) return `${label} harus berupa bilangan bulat`;
  if (parseInt(value, 10) < min) return `${label} minimal ${min}`;
  return undefined;
}

export function parseCoordinate(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((e) => e !== undefined);
}

/** Tanggal WIB 'TTTT-BB-HH'. */
export function validateDateInput(value: string, label: string, required = true): string | undefined {
  const v = value.trim();
  if (!v) return required ? `${label} wajib diisi` : undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return `${label} harus berformat TTTT-BB-HH, misalnya 2026-11-15`;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return `${label} bukan tanggal yang valid`;
  return undefined;
}

/** Jam WIB 'JJ:MM' (24 jam). */
export function validateTimeInput(value: string, label: string, required = true): string | undefined {
  const v = value.trim();
  if (!v) return required ? `${label} wajib diisi` : undefined;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return `${label} harus berformat JJ:MM, misalnya 08:30`;
  return undefined;
}

export function parseDateInput(value: string): { y: number; m: number; d: number } {
  const [y, m, d] = value.trim().split('-').map(Number);
  return { y, m: m - 1, d };
}

export function parseTimeInput(value: string): { h: number; mi: number } {
  const [h, mi] = value.trim().split(':').map(Number);
  return { h, mi };
}
