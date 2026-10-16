import type { SupabaseClient } from '@supabase/supabase-js'
import type { Destination, DestinationRepository } from '../types'

const TABLE = 'destinations'

function mapRow(r: Record<string, unknown>): Destination {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    region: (r.region as string) ?? '',
    heroImage: (r.hero_image as string) ?? undefined,
    summary: (r.summary as string) ?? undefined,
    bestTime: (r.best_time as string) ?? undefined,
    idealDuration: (r.ideal_duration as string) ?? undefined,
    goodFor: (r.good_for as string[]) ?? [],
    tripTypes: (r.trip_types as string[]) ?? [],
    tips: (r.tips as string[]) ?? [],
    aliases: (r.aliases as string[]) ?? [],
    itineraryTemplateId: (r.itinerary_template_id as string) ?? undefined,
    featured: !!r.featured,
    published: !!r.published,
    sort: (r.sort as number) ?? 0,
  }
}
function toRow(d: Destination): Record<string, unknown> {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    region: d.region ?? '',
    hero_image: d.heroImage ?? null,
    summary: d.summary ?? null,
    best_time: d.bestTime ?? null,
    ideal_duration: d.idealDuration ?? null,
    good_for: d.goodFor ?? [],
    trip_types: d.tripTypes ?? [],
    tips: d.tips ?? [],
    aliases: d.aliases ?? [],
    itinerary_template_id: d.itineraryTemplateId ?? null,
    featured: !!d.featured,
    published: !!d.published,
    sort: d.sort ?? 0,
    updated_at: new Date().toISOString(),
  }
}

/** Supabase destinations store (service-role; admin-gated in routes). */
export class SupabaseDestinationRepository implements DestinationRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async list(opts?: { region?: string; includeUnpublished?: boolean }): Promise<Destination[]> {
    let q = this.sb.from(TABLE).select('*').order('sort', { ascending: true }).order('name', { ascending: true })
    if (!opts?.includeUnpublished) q = q.eq('published', true)
    if (opts?.region) q = q.eq('region', opts.region)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []).map(mapRow)
  }
  async getBySlug(slug: string): Promise<Destination | null> {
    const { data, error } = await this.sb.from(TABLE).select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }
  async getById(id: string): Promise<Destination | null> {
    const { data, error } = await this.sb.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }
  async upsert(dest: Destination): Promise<Destination> {
    const { data, error } = await this.sb.from(TABLE).upsert(toRow(dest)).select('*').single()
    if (error) throw error
    return mapRow(data)
  }
  async remove(id: string): Promise<boolean> {
    const { error, count } = await this.sb.from(TABLE).delete({ count: 'exact' }).eq('id', id)
    if (error) throw error
    return (count ?? 0) > 0
  }
}
