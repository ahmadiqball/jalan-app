import type { SupabaseClient } from '@supabase/supabase-js'
import type { Place, PlaceRepository } from '../types'

const TABLE = 'places'

function mapRow(r: Record<string, unknown>): Place {
  return {
    id: r.id as string,
    destinationId: r.destination_id as string,
    name: r.name as string,
    type: (r.type as string) ?? 'aktivitas',
    area: (r.area as string) ?? undefined,
    priceText: (r.price_text as string) ?? undefined,
    priceLevel: (r.price_level as number) ?? undefined,
    rating: (r.rating as number) ?? undefined,
    ratingCount: (r.rating_count as number) ?? undefined,
    tags: (r.tags as string[]) ?? [],
    shortDesc: (r.short_desc as string) ?? undefined,
    longDesc: (r.long_desc as string) ?? undefined,
    gallery: (r.gallery as string[]) ?? [],
    goodToKnow: (r.good_to_know as string[]) ?? [],
    tips: (r.tips as string[]) ?? [],
    gmapsPlaceId: (r.gmaps_place_id as string) ?? undefined,
    lat: (r.lat as number) ?? undefined,
    lng: (r.lng as number) ?? undefined,
    openHours: (r.open_hours as string) ?? undefined,
    url: (r.url as string) ?? undefined,
    badge: (r.badge as string) ?? undefined,
    featured: !!r.featured,
    sort: (r.sort as number) ?? 0,
  }
}
function toRow(p: Place): Record<string, unknown> {
  return {
    id: p.id,
    destination_id: p.destinationId,
    name: p.name,
    type: p.type,
    area: p.area ?? null,
    price_text: p.priceText ?? null,
    price_level: p.priceLevel ?? null,
    rating: p.rating ?? null,
    rating_count: p.ratingCount ?? null,
    tags: p.tags ?? [],
    short_desc: p.shortDesc ?? null,
    long_desc: p.longDesc ?? null,
    gallery: p.gallery ?? [],
    good_to_know: p.goodToKnow ?? [],
    tips: p.tips ?? [],
    gmaps_place_id: p.gmapsPlaceId ?? null,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    open_hours: p.openHours ?? null,
    url: p.url ?? null,
    badge: p.badge ?? null,
    featured: !!p.featured,
    sort: p.sort ?? 0,
    updated_at: new Date().toISOString(),
  }
}

/** Supabase places store (service-role; admin-gated in routes). */
export class SupabasePlaceRepository implements PlaceRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async listByDestination(destinationId: string): Promise<Place[]> {
    const { data, error } = await this.sb
      .from(TABLE)
      .select('*')
      .eq('destination_id', destinationId)
      .order('sort', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }
  async getById(id: string): Promise<Place | null> {
    const { data, error } = await this.sb.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }
  async upsert(place: Place): Promise<Place> {
    const { data, error } = await this.sb.from(TABLE).upsert(toRow(place)).select('*').single()
    if (error) throw error
    return mapRow(data)
  }
  async remove(id: string): Promise<boolean> {
    const { error, count } = await this.sb.from(TABLE).delete({ count: 'exact' }).eq('id', id)
    if (error) throw error
    return (count ?? 0) > 0
  }
}
