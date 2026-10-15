import { createSupabase, isSupabaseConfigured } from '@fg/shared';

const cfg = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const supabaseConfigured = isSupabaseConfigured(cfg);
// Klien dibuat sekali. Bila konfigurasi kosong, layar login menampilkan petunjuk (bukan crash).
export const supabase = createSupabase(supabaseConfigured ? cfg : { url: 'https://invalid.local', anonKey: 'x'.repeat(30) });
