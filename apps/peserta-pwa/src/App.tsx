import { useCallback, useEffect, useState } from 'react';
import { configError } from './lib/supabase';
import { fetchAnnouncements, fetchEvent, fetchSchedules, lookupParticipant, ApiError } from './lib/api';
import { useAsync, useOnline } from './lib/useAsync';
import type { ParticipantLookup } from './lib/types';
import { IdentityGate, clearCode, loadCode } from './Identity';
import { Beranda } from './screens/Beranda';
import { PetaScreen } from './screens/Peta';
import { Jadwal } from './screens/Jadwal';
import { Info } from './screens/Info';
import { Loading } from './ui';

type Tab = 'beranda' | 'peta' | 'jadwal' | 'info';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'beranda', label: 'Beranda', icon: '⌂' },
  { id: 'peta', label: 'Peta', icon: '⌖' },
  { id: 'jadwal', label: 'Jadwal', icon: '▤' },
  { id: 'info', label: 'Info', icon: 'ⓘ' },
];

function tabFromHash(): Tab {
  const h = window.location.hash.replace('#', '') as Tab;
  return TABS.some((t) => t.id === h) ? h : 'beranda';
}

export function App() {
  if (configError) {
    return <main className="gate"><div className="card gate-card"><h1>Konfigurasi belum lengkap</h1><p>{configError}</p></div></main>;
  }
  return <Shell />;
}

function Shell() {
  // identity: undefined = sedang memeriksa kode tersimpan, null = belum/ tidak memakai kode
  const [who, setWho] = useState<ParticipantLookup | null | undefined>(() => (loadCode() ? undefined : null));
  const [skipped, setSkipped] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(tabFromHash());
  const online = useOnline();

  const verify = useCallback(async () => {
    const code = loadCode();
    if (!code) { setWho(null); return; }
    setVerifyError(null);
    try {
      setWho(await lookupParticipant(code));
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'PARTICIPANT_NOT_FOUND' || e.code === 'PARTICIPANT_INACTIVE')) {
        clearCode(); setWho(null);
      } else {
        setVerifyError(e instanceof Error ? e.message : 'Tidak dapat memeriksa kode peserta.');
        setWho(null);
      }
    }
  }, []);

  useEffect(() => { void verify(); }, [verify]);
  useEffect(() => {
    const on = () => setTab(tabFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const event = useAsync(fetchEvent, 60_000);
  const announcements = useAsync(fetchAnnouncements, 60_000);
  const schedules = useAsync(fetchSchedules, 60_000);

  if (who === undefined) return <Loading label="Memeriksa kode peserta…" />;
  if (who === null && !skipped && !verifyError && !loadCode()) {
    return <IdentityGate onDone={setWho} onSkip={() => setSkipped(true)} />;
  }

  const go = (t: Tab) => { window.location.hash = t; setTab(t); window.scrollTo(0, 0); };
  const logout = () => { clearCode(); setWho(null); setSkipped(false); };

  return (
    <div className="app">
      {!online && <div className="banner offline" role="status">Anda sedang offline. Data di layar mungkin sudah tidak terbaru.</div>}
      {verifyError && <div className="banner warn" role="status">{verifyError} <button className="link-btn" onClick={() => void verify()}>Coba lagi</button></div>}
      <main className="page">
        {tab === 'beranda' && <Beranda event={event} announcements={announcements} schedules={schedules} who={who} go={go} />}
        {tab === 'peta' && <PetaScreen event={event.data ?? null} who={who} />}
        {tab === 'jadwal' && <Jadwal schedules={schedules} />}
        {tab === 'info' && <Info event={event} announcements={announcements} who={who} onWho={setWho} onLogout={logout} onLogin={() => { setSkipped(false); setWho(null); clearCode(); }} />}
      </main>
      <nav className="tabbar" aria-label="Navigasi utama">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
            <span className="ti" aria-hidden>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
