/**
 * Tipe data sesuai skema Supabase aktual (diaudit lewat Supabase MCP, Okt 2026).
 * Lihat docs/FRONTEND_BACKEND_MAPPING.md.
 */

export interface Fleet {
  id: string;
  name: string;
  /** Dipilih Admin (bus-1..bus-8). null = belum dipilih. */
  icon_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  code: string;
  full_name: string;
  fleet_id: string | null;
  requested_fleet_id: string | null;
  is_active: boolean;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FleetLeader {
  fleet_id: string;
  participant_id: string;
  assigned_at: string;
}

export type PublishStatus = 'draft' | 'published' | 'archived';

export interface Schedule {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string | null;
  body: string;
  status: PublishStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventSettings {
  id: number;
  event_name: string | null;
  description: string | null;
  event_date: string | null; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  contact_info: string | null;
  general_info: string | null;
  show_map_to_participants: boolean;
  late_after_seconds: number;
  stale_after_seconds: number;
  location_request_ttl_seconds: number;
  destination_name: string | null;
  destination_address: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  destination_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  fleet_id: string;
  started_by: string | null;
  status: 'active' | 'ended';
  started_at: string;
  ended_at: string | null;
  end_reason: string | null;
  distance_m: number;
  last_battery_pct: number | null;
  last_battery_at: string | null;
}

export type TrackingStatus = 'fresh' | 'late' | 'stale' | 'trip_ended' | 'no_location';

export type LocationRequestStatus = 'pending' | 'answered' | 'expired' | 'cancelled';

export interface LastLocationRequest {
  id: string;
  requested_at: string;
  expires_at: string;
  status: LocationRequestStatus;
}

export interface Thresholds {
  late_after_seconds: number;
  stale_after_seconds: number;
}

/** get_fleet_map() -> data.fleets[] */
export interface FleetMapRow {
  fleet_id: string;
  fleet_name: string;
  icon_key: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  speed_mps: number | null;
  heading_deg: number | null;
  recorded_at: string | null;
  received_at: string | null;
  last_contact_at: string | null;
  trip_active: boolean;
  age_seconds: number | null;
  fix_age_seconds: number | null;
  distance_to_destination_m: number | null;
  status: TrackingStatus;
  last_request: LastLocationRequest | null;
}

export interface FleetMapPayload {
  server_now: string;
  thresholds: Thresholds;
  fleets: FleetMapRow[];
}

/** get_fleet_detail(p_fleet_id) -> data (jsonb_strip_nulls: field opsional bisa tidak ada) */
export interface FleetDetail {
  server_now: string;
  thresholds: Thresholds;
  fleet: { id: string; name: string; icon_key?: string; leader_name?: string; member_count: number };
  status: TrackingStatus;
  location?: {
    latitude: number;
    longitude: number;
    accuracy_m?: number;
    speed_mps?: number;
    speed_kmh?: number;
    heading_deg?: number;
    recorded_at: string;
    received_at: string;
    last_contact_at: string;
    age_seconds: number;
    fix_age_seconds: number;
  };
  destination?: {
    name?: string;
    address?: string;
    latitude: number;
    longitude: number;
    distance_m?: number;
    near_destination: boolean;
    eta_seconds?: number;
    eta_basis: string;
  };
  trip?: {
    id: string;
    status: 'active' | 'ended';
    started_at: string;
    ended_at?: string;
    duration_seconds: number;
    distance_m: number;
  };
  trail: { latitude: number; longitude: number; recorded_at: string }[];
  battery_pct?: number;
  battery_at?: string;
  last_request?: LastLocationRequest;
}

/** admin_dashboard() -> data */
export interface AdminDashboardData {
  participants_active: number;
  participants_unassigned: number;
  fleets_active: number;
  leaders_assigned: number;
  trips_active: number;
  tracking: { fresh: number; late: number; stale: number; trip_ended: number; no_location: number };
  schedules_published: number;
  announcements_published: number;
  pending_fleet_requests: number;
}

/** get_my_assignment() -> data */
export interface MyAssignment {
  participant: { id: string; code: string; full_name: string };
  fleet: { id: string; name: string; icon_key: string | null };
  members: { id: string; full_name: string }[];
  active_trip: Trip | null;
}

/** get_next_schedule() -> data */
export interface NextSchedulePayload {
  server_now: string;
  schedule: Schedule | null;
}

/** submit_location(...) -> data (bervariasi menurut code) */
export interface SubmitLocationData {
  saved?: boolean;
  received_at?: string;
  pending_request?: boolean;
  trip_distance_m?: number;
}

/** admin_set_leader_pin(...) -> data */
export interface LeaderPinData {
  pin: string;
  code: string;
}
