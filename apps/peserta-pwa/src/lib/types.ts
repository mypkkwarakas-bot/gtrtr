// Tipe sesuai skema Supabase aktual (lihat docs/FRONTEND_BACKEND_MAPPING.md).
export type TrackingStatus = 'fresh' | 'late' | 'stale' | 'trip_ended' | 'no_location';

export interface EventSettings {
  id: number;
  event_name: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  contact_info: string | null;
  general_info: string | null;
  show_map_to_participants: boolean;
  late_after_seconds: number;
  stale_after_seconds: number;
  destination_name: string | null;
  destination_address: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
}

export interface Schedule {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
}

export interface Announcement {
  id: string;
  title: string | null;
  body: string;
  sort_order: number;
  published_at: string | null;
}

export interface FleetLite {
  id: string;
  name: string;
  icon_key: string | null;
}

export interface FleetMapRow {
  fleet_id: string;
  fleet_name: string;
  icon_key: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  recorded_at: string | null;
  last_contact_at: string | null;
  trip_active: boolean;
  age_seconds: number | null;
  distance_to_destination_m: number | null;
  status: TrackingStatus;
}

export interface FleetMapPayload {
  server_now: string;
  thresholds: { late_after_seconds: number; stale_after_seconds: number };
  fleets: FleetMapRow[];
}

/** lookup_participant(p_code) -> data */
export interface ParticipantLookup {
  code: string;
  full_name: string;
  fleet: { id: string; name: string } | null;
  requested_fleet: { id: string; name: string } | null;
}
