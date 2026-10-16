/**
 * Penanganan error terpusat. Pesan mentah Supabase/PostgREST tidak pernah ditampilkan langsung
 * kepada pengguna; semuanya dipetakan ke bahasa Indonesia yang mudah dipahami.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

interface PostgrestLike {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  status?: unknown;
}

const NETWORK_PATTERN = /network request failed|failed to fetch|fetch failed|network error|timeout|timed out|econn|enotfound|offline/i;

export function isNetworkError(e: unknown): boolean {
  if (e instanceof AppError) return e.code === 'NETWORK';
  const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : '';
  return NETWORK_PATTERN.test(msg);
}

export function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e;
  if (isNetworkError(e)) {
    return new AppError('NETWORK', 'Koneksi internet bermasalah. Periksa jaringan lalu coba lagi.');
  }
  const pg = (typeof e === 'object' && e !== null ? e : {}) as PostgrestLike;
  const code = typeof pg.code === 'string' ? pg.code : '';
  const message = typeof pg.message === 'string' ? pg.message : '';

  if (code === '23505') return new AppError(code, 'Data sudah ada (duplikat). Gunakan nilai yang berbeda.');
  if (code === '23503') return new AppError(code, 'Data masih terhubung dengan data lain sehingga tidak dapat diubah.');
  if (code === '23514') return new AppError(code, 'Nilai yang dimasukkan tidak memenuhi aturan data.');
  if (code === '42501') return new AppError(code, 'Anda tidak memiliki izin untuk tindakan ini.');
  if (code === 'PGRST301' || /jwt|token.*expired|not authenticated/i.test(message)) {
    return new AppError('SESSION_EXPIRED', 'Sesi Anda telah berakhir. Silakan masuk kembali.');
  }
  if (/invalid login credentials/i.test(message)) {
    return new AppError('INVALID_CREDENTIALS', 'Email atau kata sandi tidak sesuai.');
  }
  if (/email not confirmed/i.test(message)) {
    return new AppError('EMAIL_NOT_CONFIRMED', 'Email belum dikonfirmasi.');
  }
  return new AppError(code || 'UNKNOWN', 'Terjadi kesalahan. Coba lagi beberapa saat.');
}

export function friendlyMessage(e: unknown): string {
  return toAppError(e).message;
}

export function isSessionError(e: unknown): boolean {
  const err = toAppError(e);
  return err.code === 'SESSION_EXPIRED' || err.code === 'NO_ASSIGNMENT';
}
