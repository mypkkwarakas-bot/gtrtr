import { Announcement, assertAffected, assertNoError, EventSettings, PublishStatus, Schedule, unwrapRow, unwrapRows } from '@fg/shared';
import { supabase } from './supabase';

export const SCHEDULES_KEY = ['admin_schedules'] as const;
export const ANNOUNCEMENTS_KEY = ['admin_announcements'] as const;
export const EVENT_KEY = ['event_settings'] as const;
export const FLEET_MAP_KEY = ['fleet_map'] as const;

const nz = (v: string) => (v.trim() === '' ? null : v.trim());

// ---- Jadwal (tabel schedules; admin boleh insert/update/delete) ----
export async function fetchSchedules(): Promise<Schedule[]> {
  return unwrapRows<Schedule>(await supabase.from('schedules').select('*').order('starts_at', { ascending: true }));
}
export interface ScheduleInput {
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  status: PublishStatus;
}
const schedulePayload = (i: ScheduleInput) => ({
  title: i.title.trim(), description: nz(i.description), location: nz(i.location), starts_at: i.starts_at, ends_at: i.ends_at, status: i.status,
});
export async function createSchedule(i: ScheduleInput): Promise<void> {
  assertNoError(await supabase.from('schedules').insert(schedulePayload(i)));
}
export async function updateSchedule(id: string, i: ScheduleInput): Promise<void> {
  assertAffected(await supabase.from('schedules').update(schedulePayload(i)).eq('id', id).select('id'));
}
export async function deleteSchedule(id: string): Promise<void> {
  assertAffected(await supabase.from('schedules').delete().eq('id', id).select('id'));
}

// ---- Pengumuman (tabel announcements) ----
export async function fetchAnnouncements(): Promise<Announcement[]> {
  return unwrapRows<Announcement>(
    await supabase.from('announcements').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
  );
}
export interface AnnouncementInput {
  title: string;
  body: string;
  status: PublishStatus;
  sort_order: number;
}
/** published_at diisi saat pertama kali dipublikasikan dan tidak dihapus bila diarsipkan. */
const annPayload = (i: AnnouncementInput, existing?: Announcement) => ({
  title: nz(i.title), body: i.body.trim(), status: i.status, sort_order: i.sort_order,
  published_at: i.status === 'published' ? existing?.published_at ?? new Date().toISOString() : existing?.published_at ?? null,
});
export async function createAnnouncement(i: AnnouncementInput): Promise<void> {
  assertNoError(await supabase.from('announcements').insert(annPayload(i)));
}
export async function updateAnnouncement(id: string, i: AnnouncementInput, existing?: Announcement): Promise<void> {
  assertAffected(await supabase.from('announcements').update(annPayload(i, existing)).eq('id', id).select('id'));
}
export async function deleteAnnouncement(id: string): Promise<void> {
  assertAffected(await supabase.from('announcements').delete().eq('id', id).select('id'));
}

// ---- Pengaturan kegiatan & destinasi (event_settings id=1; admin boleh update) ----
export async function fetchEvent(): Promise<EventSettings | null> {
  return unwrapRow<EventSettings>(await supabase.from('event_settings').select('*').eq('id', 1).maybeSingle());
}
export interface EventInfoInput {
  event_name: string;
  description: string;
  event_date: string;
  start_time: string;
  contact_info: string;
  general_info: string;
  show_map_to_participants: boolean;
  late_after_seconds: number;
  stale_after_seconds: number;
  location_request_ttl_seconds: number;
}
export async function updateEventInfo(i: EventInfoInput): Promise<void> {
  assertAffected(await supabase.from('event_settings').update({
    event_name: nz(i.event_name), description: nz(i.description), event_date: nz(i.event_date), start_time: nz(i.start_time),
    contact_info: nz(i.contact_info), general_info: nz(i.general_info), show_map_to_participants: i.show_map_to_participants,
    late_after_seconds: i.late_after_seconds, stale_after_seconds: i.stale_after_seconds, location_request_ttl_seconds: i.location_request_ttl_seconds,
  }).eq('id', 1).select('id'));
}
export interface DestinationInput {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
}
export async function updateDestination(i: DestinationInput): Promise<void> {
  assertAffected(await supabase.from('event_settings').update({
    destination_name: nz(i.name), destination_address: nz(i.address), destination_lat: i.lat, destination_lng: i.lng,
    destination_updated_at: new Date().toISOString(),
  }).eq('id', 1).select('id'));
}
