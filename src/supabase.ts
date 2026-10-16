import { createSupabase, isSupabaseConfigured } from '@fg/shared';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

const cfg = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

export const supabaseConfigured = isSupabaseConfigured(cfg);
// Klien dibuat sekali. Bila konfigurasi kosong, layar login menampilkan petunjuk (bukan crash).
export const supabase = createSupabase(supabaseConfigured ? cfg : { url: 'https://invalid.local', anonKey: 'x'.repeat(30) });
