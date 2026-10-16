import { assertAffected, assertNoError, Fleet, isBusIconKey, unwrapRows } from '@fg/shared';
import { supabase } from '../supabase';

export const FLEETS_KEY = ['fleets'] as const;

export async function fetchFleets(): Promise<Fleet[]> {
  const res = await supabase.from('fleets').select('*').order('name', { ascending: true });
  return unwrapRows<Fleet>(res);
}

export interface FleetInput {
  name: string;
  icon_key: string | null;
  is_active: boolean;
}

function payload(input: FleetInput) {
  return { name: input.name.trim(), icon_key: isBusIconKey(input.icon_key) ? input.icon_key : null, is_active: input.is_active };
}

export async function createFleet(input: FleetInput): Promise<void> {
  assertNoError(await supabase.from('fleets').insert(payload(input)));
}

export async function updateFleet(id: string, input: FleetInput): Promise<void> {
  assertAffected(await supabase.from('fleets').update(payload(input)).eq('id', id).select('id'));
}

/** Peta ikon -> nama armada lain yang memakainya (untuk peringatan pemakaian ganda). */
export function iconUsage(fleets: Fleet[], exceptId?: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of fleets) {
    if (f.id !== exceptId && f.is_active && f.icon_key) map[f.icon_key] = map[f.icon_key] ? `${map[f.icon_key]}, ${f.name}` : f.name;
  }
  return map;
}
