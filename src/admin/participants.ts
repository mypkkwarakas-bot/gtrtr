import { assertAffected, assertNoError, Participant, unwrapRows } from '@fg/shared';
import { supabase } from '../supabase';

export const PARTICIPANTS_KEY = ['participants'] as const;

/** Memuat semua peserta (batas bawaan PostgREST 1000 baris; cukup untuk satu kegiatan). */
export async function fetchParticipants(): Promise<Participant[]> {
  const res = await supabase.from('participants').select('*').order('full_name', { ascending: true }).range(0, 4999);
  return unwrapRows<Participant>(res);
}

export interface ParticipantInput {
  full_name: string;
  fleet_id: string | null;
  is_active: boolean;
}

function payload(i: ParticipantInput) {
  return { full_name: i.full_name.trim(), fleet_id: i.fleet_id, is_active: i.is_active };
}

// Kolom `code` dibuat otomatis oleh backend (gen_participant_code()); tidak dikirim dari klien.
export async function createParticipant(i: ParticipantInput): Promise<void> {
  assertNoError(await supabase.from('participants').insert(payload(i)));
}

export async function updateParticipant(id: string, i: ParticipantInput): Promise<void> {
  assertAffected(await supabase.from('participants').update(payload(i)).eq('id', id).select('id'));
}
