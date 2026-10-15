import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { AppError, bindAuthAutoRefresh, Envelope, rpcOk, toAppError, MyAssignment } from '@fg/shared';
import { supabase } from './supabase';
import { stopTracking } from './tracking';

type Status = 'loading' | 'signedOut' | 'kepala';
interface AuthValue {
  status: Status;
  signIn: (code: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthValue | null>(null);

const isKepala = (s: Session | null) => s?.user.app_metadata?.role === 'kepala';

interface LoginData {
  session: { access_token: string; refresh_token: string; expires_in: number; expires_at: number };
  participant: { id: string; full_name: string; fleet_id: string };
}

/** Memanggil Edge Function `leader-login` (verify_jwt=false; kode + PIN diverifikasi di database). */
async function callLeaderLogin(code: string, pin: string): Promise<LoginData> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const res = await fetch(`${url}/functions/v1/leader-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey },
    body: JSON.stringify({ code: code.trim().toUpperCase(), pin: pin.trim() }),
  });
  let env: Envelope<LoginData> | null = null;
  try {
    env = (await res.json()) as Envelope<LoginData>;
  } catch {
    throw new AppError('BAD_RESPONSE', 'Respons server tidak dikenali.');
  }
  if (!env?.ok || !env.data) {
    throw new AppError(env?.code ?? 'UNKNOWN', env?.message ?? 'Login gagal.');
  }
  return env.data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stop = bindAuthAutoRefresh(supabase);
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    }).catch(() => { if (alive) setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { alive = false; sub.subscription.unsubscribe(); stop(); };
  }, []);

  const signIn = useCallback(async (code: string, pin: string) => {
    try {
      const data = await callLeaderLogin(code, pin);
      const { data: set, error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (error) throw toAppError(error);
      if (!isKepala(set.session)) throw new AppError('NOT_LEADER', 'Akun ini bukan akun Kepala Rombongan.');
      // Pastikan penugasan aktif benar-benar terbaca server sebelum masuk.
      await rpcOk<MyAssignment>(supabase, 'get_my_assignment');
    } catch (e) {
      await supabase.auth.signOut().catch(() => undefined);
      throw toAppError(e);
    }
  }, []);

  const signOut = useCallback(async () => {
    await stopTracking().catch(() => undefined);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status: !ready ? 'loading' : isKepala(session) ? 'kepala' : 'signedOut', signIn, signOut }),
    [ready, session, signIn, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth harus di dalam AuthProvider');
  return v;
}
