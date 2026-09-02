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

  async listForUser(userId: string, email: string): Promise<TripRow[]> {
    // owned
    const owned = await this.sb.from(TABLE).select('*').eq('owner_id', userId)
    if (owned.error) throw owned.error
    // shared: data.members contains an object with this email (JSONB @>)
    const shared = await this.sb
      .from(TABLE)
      .select('*')
      .contains('data', { members: [{ email: email.toLowerCase() }] })
    if (shared.error) throw shared.error

    const byId = new Map<string, TripRow>()
    for (const r of [...(owned.data ?? []), ...(shared.data ?? [])]) byId.set(r.id as string, mapRow(r))
    return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
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

  async create(ownerId: string, trip: TripData): Promise<TripRow> {
    const row = {
      id: trip.id,
      owner_id: ownerId,
      data: trip,
      share_id: null,
      version: 1,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await this.sb.from(TABLE).insert(row).select().single()
    if (error) throw error
    return mapRow(data)
  }

  async replace(id: string, trip: TripData): Promise<TripRow | null> {
    // read current version for the bump; owner_id & share_id are left untouched
    const { data: cur, error: readErr } = await this.sb
      .from(TABLE)
      .select('version')
      .eq('id', id)
      .maybeSingle()
    if (readErr) throw readErr
    if (!cur) return null
    const { data, error } = await this.sb
      .from(TABLE)
      .update({ data: trip, version: ((cur.version as number) ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
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
