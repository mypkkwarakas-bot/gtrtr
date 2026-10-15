import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ToneName } from '../theme/tokens';
import { PublishStatus, TrackingStatus } from './types';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface StatusMeta {
  label: string;
  tone: ToneName;
  icon: IconName;
}

/** Status lokasi dari backend (get_fleet_map / get_fleet_detail). Ikon + label, bukan warna saja. */
export function trackingStatusMeta(status: TrackingStatus): StatusMeta {
  switch (status) {
    case 'fresh':
      return { label: 'Lokasi terkini', tone: 'success', icon: 'radio-button-on' };
    case 'late':
      return { label: 'Lokasi tertunda', tone: 'warning', icon: 'time-outline' };
    case 'stale':
      return { label: 'Lokasi lama', tone: 'danger', icon: 'alert-circle-outline' };
    case 'trip_ended':
      return { label: 'Perjalanan berakhir', tone: 'neutral', icon: 'flag-outline' };
    case 'no_location':
    default:
      return { label: 'Belum ada lokasi', tone: 'neutral', icon: 'location-outline' };
  }
}

export function publishStatusMeta(status: PublishStatus): StatusMeta {
  switch (status) {
    case 'published':
      return { label: 'Terpublikasi', tone: 'success', icon: 'checkmark-circle-outline' };
    case 'archived':
      return { label: 'Diarsipkan', tone: 'neutral', icon: 'archive-outline' };
    case 'draft':
    default:
      return { label: 'Draf', tone: 'warning', icon: 'create-outline' };
  }
}

/**
 * Menghitung ulang status kesegaran lokasi di klien dengan ambang yang sama seperti backend,
 * agar tampilan tetap akurat di antara dua pengambilan data. `serverOffsetMs` = serverNow - clientNow
 * pada saat data diambil.
 */
export function liveTrackingStatus(args: {
  tripActive: boolean;
  hasLocation: boolean;
  lastContactAt: string | null;
  thresholds: { late_after_seconds: number; stale_after_seconds: number };
  serverOffsetMs: number;
  now?: number;
}): TrackingStatus {
  if (!args.hasLocation) return 'no_location';
  if (!args.tripActive) return 'trip_ended';
  if (!args.lastContactAt) return 'stale';
  const nowServer = (args.now ?? Date.now()) + args.serverOffsetMs;
  const age = (nowServer - new Date(args.lastContactAt).getTime()) / 1000;
  if (age <= args.thresholds.late_after_seconds) return 'fresh';
  if (age <= args.thresholds.stale_after_seconds) return 'late';
  return 'stale';
}
