import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const configError =
  !url || !key || url.includes('<project-ref>') || key.includes('xxxx')
    ? 'Konfigurasi Supabase belum diisi (VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY).'
    : null;

// PWA hanya membaca data publik lewat peran anon; tidak ada sesi login, jadi tidak ada token yang disimpan.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing', {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
