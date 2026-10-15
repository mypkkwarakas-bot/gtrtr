import { supabase } from './supabase';
import type {
  Announcement, EventSettings, FleetLite, FleetMapPayload, ParticipantLookup, Schedule,
} from './types';

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

interface Envelope<T> { ok: boolean; code: string; message: string | null; data: T | null }

function transportError(e: { message?: string } | null): ApiError {
  const msg = (e?.message ?? '').toLowerCase();
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('load failed')) {
    return new ApiError('NETWORK', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }
  return new ApiError('SERVER', 'Terjadi gangguan pada server. Coba lagi sebentar lagi.');
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<Envelope<T>> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw transportError(error);
  if (!data || typeof data !== 'object') throw new ApiError('BAD_RESPONSE', 'Respons server tidak dikenali.');
  return data as Envelope<T>;
}

export async function fetchEvent(): Promise<EventSettings | null> {
  const { data, error } = await supabase.from('event_settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw transportError(error);
  return (data as EventSettings | null) ?? null;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('id,title,body,sort_order,published_at')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });
  if (error) throw transportError(error);
  return (data ?? []) as Announcement[];
}

export async function fetchSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('id,title,description,starts_at,ends_at,location')
    .eq('status', 'published')
    .order('starts_at', { ascending: true });
  if (error) throw transportError(error);
  return (data ?? []) as Schedule[];
}

export async function fetchFleets(): Promise<FleetLite[]> {
  const { data, error } = await supabase
    .from('fleets').select('id,name,icon_key').eq('is_active', true).order('name');
  if (error) throw transportError(error);
  return (data ?? []) as FleetLite[];
}

/** Hasil: peta, atau `disabled` bila panitia menyembunyikan peta dari peserta (MAP_DISABLED). */
export async function fetchFleetMap(): Promise<{ disabled: false; map: FleetMapPayload } | { disabled: true }> {
  const env = await rpc<FleetMapPayload>('get_fleet_map');
  if (env.ok && env.data) return { disabled: false, map: env.data };
  if (env.code === 'MAP_DISABLED') return { disabled: true };
  throw new ApiError(env.code, env.message ?? 'Peta tidak dapat dimuat.');
}

export async function lookupParticipant(code: string): Promise<ParticipantLookup> {
  const env = await rpc<ParticipantLookup>('lookup_participant', { p_code: code });
  if (!env.ok || !env.data) throw new ApiError(env.code, env.message ?? 'Kode peserta tidak dapat diverifikasi.');
  return env.data;
}

export async function requestFleet(code: string, fleetId: string): Promise<string> {
  const env = await rpc<null>('request_fleet', { p_code: code, p_fleet_id: fleetId });
  if (!env.ok) throw new ApiError(env.code, env.message ?? 'Permintaan armada gagal.');
  return env.message ?? 'Permintaan dicatat.';
}
