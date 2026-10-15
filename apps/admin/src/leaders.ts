import { assertNoError, Envelope, FleetDetail, FleetLeader, LeaderPinData, rpc, rpcOk, unwrapRows } from '@fg/shared';
import { supabase } from './supabase';

export const LEADERS_KEY = ['fleet_leaders'] as const;
export const fleetDetailKey = (id: string) => ['fleet_detail', id] as const;

export async function fetchLeaders(): Promise<FleetLeader[]> {
  return unwrapRows<FleetLeader>(await supabase.from('fleet_leaders').select('*'));
}

export async function fetchFleetDetail(fleetId: string): Promise<FleetDetail> {
  return (await rpcOk<FleetDetail>(supabase, 'get_fleet_detail', { p_fleet_id: fleetId })).data;
}

export async function assignLeader(fleetId: string, participantId: string): Promise<void> {
  await rpcOk(supabase, 'assign_fleet_leader', { p_fleet_id: fleetId, p_participant_id: participantId });
}

export async function unassignLeader(fleetId: string): Promise<void> {
  await rpcOk(supabase, 'unassign_fleet_leader', { p_fleet_id: fleetId });
}

/** pin = undefined -> backend membuat PIN acak 6 digit. PIN hanya dikembalikan sekali; jangan disimpan/di-log. */
export async function setLeaderPin(participantId: string, pin?: string): Promise<LeaderPinData> {
  const args: Record<string, unknown> = { p_participant_id: participantId };
  if (pin) args.p_pin = pin;
  return (await rpcOk<LeaderPinData>(supabase, 'admin_set_leader_pin', args)).data;
}

export async function setLeaderAccess(participantId: string, enabled: boolean): Promise<void> {
  await rpcOk(supabase, 'admin_set_leader_access', { p_participant_id: participantId, p_enabled: enabled });
}

/** Mengembalikan envelope karena ALREADY_PENDING adalah ok=true dengan arti berbeda. */
export async function requestLocation(fleetId: string): Promise<Envelope<unknown>> {
  return rpc<unknown>(supabase, 'request_fleet_location', { p_fleet_id: fleetId });
}

export { assertNoError };
