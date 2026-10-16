import { SupabaseClient } from '@supabase/supabase-js';
import { AppError, toAppError } from './errors';

/** Bentuk respons seragam semua RPC backend: public._res(ok, code, message, data). */
export interface Envelope<T> {
  ok: boolean;
  code: string;
  message: string | null;
  data: T | null;
}

/** Memanggil RPC dan mengembalikan envelope apa adanya. Hanya error transport yang dilempar. */
export async function rpc<T>(
  client: SupabaseClient,
  fn: string,
  args?: Record<string, unknown>,
): Promise<Envelope<T>> {
  const { data, error } = await client.rpc(fn, args);
  if (error) throw toAppError(error);
  if (data === null || typeof data !== 'object') {
    throw new AppError('BAD_RESPONSE', 'Respons server tidak dikenali.');
  }
  return data as Envelope<T>;
}

/** Seperti rpc(), tetapi melempar AppError dengan pesan backend bila ok=false. */
export async function rpcOk<T>(
  client: SupabaseClient,
  fn: string,
  args?: Record<string, unknown>,
): Promise<{ data: T; code: string; message: string | null }> {
  const env = await rpc<T>(client, fn, args);
  if (!env.ok) throw new AppError(env.code, env.message ?? 'Operasi gagal.');
  return { data: env.data as T, code: env.code, message: env.message };
}

/** Membaca hasil query tabel dan melempar error yang sudah dipetakan. */
export function unwrapRows<T>(res: { data: unknown; error: unknown }): T[] {
  if (res.error) throw toAppError(res.error);
  return (res.data ?? []) as T[];
}

export function unwrapRow<T>(res: { data: unknown; error: unknown }): T | null {
  if (res.error) throw toAppError(res.error);
  return (res.data ?? null) as T | null;
}

export function assertNoError(res: { error: unknown }): void {
  if (res.error) throw toAppError(res.error);
}

/**
 * Untuk update/delete tabel: RLS dapat membuat operasi "berhasil" tanpa mengubah baris apa pun.
 * Gunakan `.select('id')` pada query lalu panggil ini agar tidak ada pesan sukses palsu.
 */
export function assertAffected(res: { data: unknown; error: unknown }): void {
  if (res.error) throw toAppError(res.error);
  if (!Array.isArray(res.data) || res.data.length === 0) {
    throw new AppError('NOT_SAVED', 'Perubahan tidak tersimpan. Data tidak ditemukan atau Anda tidak memiliki izin.');
  }
}
