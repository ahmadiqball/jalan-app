import type { SupabaseClient } from '@supabase/supabase-js'
import type { TripData, TripRepository, TripRow } from '../types'

const TABLE = 'trips'

/** Map a DB row (snake_case) to a TripRow. */
function mapRow(row: Record<string, unknown>): TripRow {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    data: row.data as TripData,
    shareId: (row.share_id as string | null) ?? null,
    version: (row.version as number) ?? 0,
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  }
}

/**
 * Supabase-backed trip store. Reached only from Nitro with the service-role key,
 * so RLS is enabled deny-all as defence-in-depth; per-owner authorization is
 * enforced here and in the routes.
 */
export class SupabaseTripRepository implements TripRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async listByOwner(ownerId: string): Promise<TripRow[]> {
    const { data, error } = await this.sb
      .from(TABLE)
      .select('*')
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async get(id: string): Promise<TripRow | null> {
    const { data, error } = await this.sb.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async getByShare(shareId: string): Promise<TripRow | null> {
    const { data, error } = await this.sb.from(TABLE).select('*').eq('share_id', shareId).maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async save(ownerId: string, trip: TripData): Promise<TripRow> {
    const { data: existing, error: readErr } = await this.sb
      .from(TABLE)
      .select('owner_id, version, share_id')
      .eq('id', trip.id)
      .maybeSingle()
    if (readErr) throw readErr
    if (existing && existing.owner_id !== ownerId) {
      throw createError({ statusCode: 403, statusMessage: 'Bukan trip milikmu' })
    }
    const row = {
      id: trip.id,
      owner_id: ownerId,
      data: trip,
      share_id: existing?.share_id ?? null,
      version: ((existing?.version as number) ?? 0) + 1,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await this.sb.from(TABLE).upsert(row).select().single()
    if (error) throw error
    return mapRow(data)
  }

  async remove(ownerId: string, id: string): Promise<boolean> {
    const { data, error } = await this.sb
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('id')
    if (error) throw error
    return (data?.length ?? 0) > 0
  }

  async setShare(ownerId: string, id: string, shareId: string | null): Promise<TripRow | null> {
    const { data, error } = await this.sb
      .from(TABLE)
      .update({ share_id: shareId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }
}
