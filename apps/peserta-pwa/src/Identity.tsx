import { useState, type FormEvent } from 'react';
import { ApiError, lookupParticipant } from './lib/api';
import type { ParticipantLookup } from './lib/types';

const KEY = 'fg.participant_code';

export function loadCode(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function saveCode(code: string): void {
  try { localStorage.setItem(KEY, code); } catch { /* penyimpanan diblokir: identitas hanya bertahan selama tab terbuka */ }
}
export function clearCode(): void {
  try { localStorage.removeItem(KEY); } catch { /* abaikan */ }
}

export function IdentityGate({ onDone, onSkip }: { onDone: (p: ParticipantLookup) => void; onSkip: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 4) { setErr('Masukkan kode peserta Anda (minimal 4 karakter).'); return; }
    setBusy(true); setErr(null);
    try {
      const p = await lookupParticipant(c);
      saveCode(p.code);
      onDone(p);
    } catch (e2) {
      setErr(e2 instanceof ApiError || e2 instanceof Error ? e2.message : 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="gate">
      <img src="/icons/icon-192.png" width={96} height={96} alt="" className="gate-logo" />
      <h1>Family Gathering</h1>
      <p className="gate-sub">KLKM Jakarta Utara</p>
      <form onSubmit={submit} className="card gate-card">
        <label htmlFor="code">Kode peserta</label>
        <input
          id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false}
          inputMode="text" maxLength={20} placeholder="Contoh: ABCD12" disabled={busy}
          aria-describedby={err ? 'code-err' : undefined}
        />
        {err && <p id="code-err" className="field-error" role="alert">{err}</p>}
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
        <p className="hint">Kode peserta diberikan panitia. Tanpa kode, Anda tetap dapat melihat informasi umum.</p>
        <button type="button" className="btn link" onClick={onSkip}>Lihat informasi tanpa kode</button>
      </form>
    </main>
  );
}
