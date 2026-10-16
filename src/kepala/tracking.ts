import { useSyncExternalStore } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { isNetworkError, rpc, SubmitLocationData } from '@fg/shared';
import { supabase } from '../supabase';

/**
 * Pengiriman GPS aktual ke backend (RPC submit_location). Tidak ada koordinat simulasi.
 * Antrean offline hanya di memori (hilang bila aplikasi dimatikan paksa) dan item >15 menit dibuang,
 * sesuai aturan backend LOCATION_TOO_OLD. Lihat docs/FRONTEND_BACKEND_MAPPING.md.
 */
export const LOCATION_TASK = 'fg-kepala-location';
const TRIP_KEY = 'fg_active_trip_id';
const MAX_AGE_MS = 14 * 60 * 1000;
const MAX_QUEUE = 120;
const STOP_CODES = new Set(['TRIP_ENDED', 'NO_ASSIGNMENT', 'TRIP_NOT_FOUND']);
const DROP_CODES = new Set(['LOCATION_TOO_OLD', 'IGNORED_OLDER', 'INVALID_COORDINATES', 'INVALID_TIMESTAMP', 'INVALID_ACCURACY', 'INVALID_SPEED', 'INVALID_BATTERY']);

export interface TrackingState {
  running: boolean;
  lastSavedAt: number | null;
  lastError: string | null;
  queued: number;
}
let state: TrackingState = { running: false, lastSavedAt: null, lastError: null, queued: 0 };
const listeners = new Set<() => void>();
function setState(patch: Partial<TrackingState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export function useTrackingState(): TrackingState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state,
  );
}

interface Pending { lat: number; lng: number; accuracy: number | null; speed: number | null; heading: number | null; recordedAt: number }
let queue: Pending[] = [];
let flushing = false;

const toPending = (l: Location.LocationObject): Pending => ({
  lat: l.coords.latitude,
  lng: l.coords.longitude,
  // Backend menolak nilai negatif/di luar rentang (CHECK accuracy>=0, speed>=0, 0<=heading<360); sensor memakai -1 untuk "tidak diketahui".
  accuracy: l.coords.accuracy != null && l.coords.accuracy >= 0 ? l.coords.accuracy : null,
  speed: l.coords.speed != null && l.coords.speed >= 0 ? l.coords.speed : null,
  heading: l.coords.heading != null && l.coords.heading >= 0 && l.coords.heading < 360 ? l.coords.heading : null,
  recordedAt: l.timestamp,
});

async function flush(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const tripId = await SecureStore.getItemAsync(TRIP_KEY);
    if (!tripId) { queue = []; setState({ queued: 0 }); return; }
    while (queue.length > 0) {
      queue = queue.filter((p) => Date.now() - p.recordedAt <= MAX_AGE_MS);
      const next = queue[0];
      if (!next) break;
      let env;
      try {
        env = await rpc<SubmitLocationData>(supabase, 'submit_location', {
          p_trip_id: tripId, p_lat: next.lat, p_lng: next.lng, p_accuracy: next.accuracy,
          p_recorded_at: new Date(next.recordedAt).toISOString(), p_speed: next.speed, p_heading: next.heading, p_battery_pct: null,
        });
      } catch (e) {
        setState({ queued: queue.length, lastError: isNetworkError(e) ? 'Jaringan terputus. Lokasi menunggu dikirim.' : 'Lokasi belum terkirim. Mencoba lagi.' });
        return;
      }
      if (env.ok) {
        queue.shift();
        if (env.data?.saved) setState({ lastSavedAt: Date.now(), lastError: null });
      } else if (STOP_CODES.has(env.code)) {
        queue = [];
        setState({ queued: 0, lastError: env.message ?? 'Perjalanan tidak aktif.' });
        await stopTracking();
        return;
      } else if (DROP_CODES.has(env.code)) {
        queue.shift();
      } else {
        setState({ queued: queue.length, lastError: env.message ?? 'Lokasi ditolak server.' });
        return;
      }
      setState({ queued: queue.length });
    }
  } finally {
    flushing = false;
  }
}

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK, async ({ data, error }) => {
  if (error) { setState({ lastError: 'GPS bermasalah. Periksa izin dan pengaturan lokasi.' }); return; }
  const locs = [...(data?.locations ?? [])].sort((a, b) => a.timestamp - b.timestamp);
  if (locs.length === 0) return;
  queue = [...queue, ...locs.map(toPending)].slice(-MAX_QUEUE);
  setState({ queued: queue.length });
  await flush();
});

export type PermissionResult = 'granted' | 'denied' | 'gps_off';

/** Izin lokasi foreground wajib; izin background diminta sebisanya dan dilaporkan jujur. */
export async function ensureLocationPermission(): Promise<{ result: PermissionResult; background: boolean }> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return { result: 'denied', background: false };
  if (!(await Location.hasServicesEnabledAsync())) return { result: 'gps_off', background: false };
  let bg = await Location.getBackgroundPermissionsAsync();
  if (!bg.granted) bg = await Location.requestBackgroundPermissionsAsync();
  return { result: 'granted', background: bg.granted };
}

export async function startTracking(tripId: string): Promise<void> {
  await SecureStore.setItemAsync(TRIP_KEY, tripId);
  if (!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 0,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Family Gathering — perjalanan berjalan',
        notificationBody: 'Lokasi armada dibagikan ke panitia.',
        notificationColor: '#0A3328',
      },
    });
  }
  setState({ running: true, lastError: null });
}

export async function stopTracking(): Promise<void> {
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  } finally {
    await SecureStore.deleteItemAsync(TRIP_KEY).catch(() => undefined);
    queue = [];
    setState({ running: false, queued: 0 });
  }
}

export async function isTrackingActive(): Promise<boolean> {
  const on = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
  setState({ running: on });
  return on;
}
