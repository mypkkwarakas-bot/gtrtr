import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;      // pemuatan pertama
  refreshing: boolean;   // pengambilan ulang saat data lama masih ada
  updatedAt: number | null;
  reload: () => void;
}

/** Mengambil data, mengulang tiap `intervalMs` hanya saat tab terlihat, dan saat kembali online/terlihat. */
export function useAsync<T>(fn: () => Promise<T>, intervalMs?: number): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const alive = useRef(true);
  const seq = useRef(0);

  const run = useCallback(async () => {
    const my = ++seq.current;
    setRefreshing(true);
    try {
      const res = await fnRef.current();
      if (!alive.current || my !== seq.current) return;
      setData(res);
      setError(null);
      setUpdatedAt(Date.now());
    } catch (e) {
      if (!alive.current || my !== seq.current) return;
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      if (alive.current && my === seq.current) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void run();
    const onVisible = () => { if (document.visibilityState === 'visible') void run(); };
    const onOnline = () => void run();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    const timer = intervalMs
      ? window.setInterval(() => { if (document.visibilityState === 'visible') void run(); }, intervalMs)
      : null;
    return () => {
      alive.current = false;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
      if (timer) window.clearInterval(timer);
    };
  }, [run, intervalMs]);

  return { data, error, loading, refreshing, updatedAt, reload: () => void run() };
}

export function useOnline(): boolean {
  const [on, setOn] = useState(navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true), b = () => setOn(false);
    window.addEventListener('online', a); window.addEventListener('offline', b);
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); };
  }, []);
  return on;
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
