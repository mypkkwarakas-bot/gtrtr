import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { AppError, bindAuthAutoRefresh, Envelope, MyAssignment, rpcOk, toAppError } from '@fg/shared';
import { supabase } from './supabase';
import { stopTracking } from './kepala/tracking';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/** Peran ditentukan server lewat app_metadata.role, bukan pilihan di klien. */
export type Role = 'admin' | 'kepala';
type Status = 'loading' | 'signedOut' | Role;

interface AuthValue {
  status: Status;
  email: string | null;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signInKepala: (pin: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthValue | null>(null);

const roleOf = (s: Session | null): Role | null => {
  const r = s?.user.app_metadata?.role;
  return r === 'admin' || r === 'kepala' ? r : null;
};

interface LoginData {
  session: { access_token: string; refresh_token: string; expires_in: number; expires_at: number };
  participant: { id: string; full_name: string; fleet_id: string };
}

/** Memanggil Edge Function `leader-login` (verify_jwt=false). Kepala cukup mengirim PIN yang didaftarkan Admin. */
async function callLeaderLogin(pin: string): Promise<LoginData> {
  const url = SUPABASE_URL;
  const anonKey = SUPABASE_ANON_KEY;
  const res = await fetch(`${url}/functions/v1/leader-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey },
    body: JSON.stringify({ pin: pin.trim() }),
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

  const signInAdmin = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw toAppError(error);
    if (roleOf(data.session) !== 'admin') {
      await supabase.auth.signOut();
      throw new AppError('NOT_ADMIN', 'Akun ini bukan akun Admin.');
    }
  }, []);

  const signInKepala = useCallback(async (pin: string) => {
    try {
      const data = await callLeaderLogin(pin);
      const { data: set, error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (error) throw toAppError(error);
      if (roleOf(set.session) !== 'kepala') throw new AppError('NOT_LEADER', 'Akun ini bukan akun Kepala Rombongan.');
      // Pastikan penugasan aktif benar-benar terbaca server sebelum masuk.
      await rpcOk<MyAssignment>(supabase, 'get_my_assignment');
    } catch (e) {
      await supabase.auth.signOut().catch(() => undefined);
      throw toAppError(e);
    }
  }, []);

  const signOut = useCallback(async () => {
    await stopTracking().catch(() => undefined); // aman dipanggil walau bukan Kepala
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(() => {
    const role = roleOf(session);
    return {
      status: !ready ? 'loading' : (role ?? 'signedOut'),
      email: session?.user.email ?? null,
      signInAdmin,
      signInKepala,
      signOut,
    };
  }, [ready, session, signInAdmin, signInKepala, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth harus di dalam AuthProvider');
  return v;
}
