import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';
import { secureStorage } from './secureStorage';

export interface SupabaseConfig {
  url: string;
  /** Kunci publishable / anon. JANGAN pernah memakai service-role key di sini. */
  anonKey: string;
}

export function isSupabaseConfigured(cfg: SupabaseConfig): boolean {
  return /^https:\/\/.+/.test(cfg.url) && cfg.anonKey.length > 20;
}

export function createSupabase(cfg: SupabaseConfig): SupabaseClient {
  return createClient(cfg.url, cfg.anonKey, {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Menjalankan auto-refresh token hanya saat aplikasi aktif (praktik yang dianjurkan Supabase
 * untuk React Native). Mengembalikan fungsi pembersih.
 */
export function bindAuthAutoRefresh(client: SupabaseClient): () => void {
  const apply = (state: AppStateStatus) => {
    if (state === 'active') void client.auth.startAutoRefresh();
    else void client.auth.stopAutoRefresh();
  };
  apply(AppState.currentState);
  const sub = AppState.addEventListener('change', apply);
  return () => sub.remove();
}
