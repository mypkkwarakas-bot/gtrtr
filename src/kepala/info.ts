import { Announcement, EventSettings, Schedule, unwrapRow, unwrapRows } from '@fg/shared';
import { supabase } from '../supabase';

/** Hanya konten terpublikasi (policy RLS sch_select / ann_select juga membatasi hal yang sama). */
export async function fetchSchedules(): Promise<Schedule[]> {
  return unwrapRows<Schedule>(
    await supabase.from('schedules').select('*').eq('status', 'published').order('starts_at', { ascending: true }),
  );
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  return unwrapRows<Announcement>(
    await supabase.from('announcements').select('*').eq('status', 'published')
      .order('sort_order', { ascending: true }).order('published_at', { ascending: false }),
  );
}

export async function fetchEvent(): Promise<EventSettings | null> {
  return unwrapRow<EventSettings>(await supabase.from('event_settings').select('*').eq('id', 1).maybeSingle());
}
