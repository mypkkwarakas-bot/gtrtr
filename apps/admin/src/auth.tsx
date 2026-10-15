import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { AppError, bindAuthAutoRefresh, toAppError } from '@fg/shared';
import { supabase } from './supabase';

type Status = 'loading' | 'signedOut' | 'admin';
interface AuthValue {
  status: Status;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthValue | null>(null);

const isAdmin = (s: Session | null) => s?.user.app_metadata?.role === 'admin';

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

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw toAppError(error);
    if (!isAdmin(data.session)) {
      await supabase.auth.signOut();
      throw new AppError('NOT_ADMIN', 'Akun ini bukan akun Admin.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status: !ready ? 'loading' : isAdmin(session) ? 'admin' : 'signedOut', email: session?.user.email ?? null, signIn, signOut }),
    [ready, session, signIn, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth harus di dalam AuthProvider');
  return v;
}
