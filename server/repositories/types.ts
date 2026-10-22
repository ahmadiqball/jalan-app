/**
 * Storage-agnostic contract the trip API depends on. Swapping databases = a new
 * implementation; routes never change. A trip is stored as an opaque JSON
 * document (`data`) keyed by its client-generated id and scoped to an owner —
 * the natural realization of "JSONB whole-doc + patchTrip".
 */
export type TripData = Record<string, unknown> & { id: string }

export interface TripRow {
  id: string
  ownerId: string
  data: TripData
  shareId: string | null
  version: number
  updatedAt: string
}

export interface TripRepository {
  /** Trips a user can see: owned OR a member (by email). Newest first. */
  listForUser(userId: string, email: string): Promise<TripRow[]>
  /** One trip by id, regardless of owner (route enforces access). */
  get(id: string): Promise<TripRow | null>
  /** Public read: a trip exposed under a share slug. */
  getByShare(shareId: string): Promise<TripRow | null>
  /** Create a new trip owned by ownerId. */
  create(ownerId: string, trip: TripData): Promise<TripRow>
  /** Replace an existing trip's document — preserves owner & share, bumps version. */
  replace(id: string, trip: TripData): Promise<TripRow | null>
  /** Delete a trip the owner owns. Returns whether a row was removed. */
  remove(ownerId: string, id: string): Promise<boolean>
  /** Enable (slug) or disable (null) public sharing; returns the updated row. */
  setShare(ownerId: string, id: string, shareId: string | null): Promise<TripRow | null>
}

/* ── app content (admin-managed): starter templates + packing recommendations ── */
/** A template is a full trip document stored opaquely (client owns its shape). */
export type TemplateTrip = TripData
export interface PackRecItem {
  id: string
  label: string
  /** barang groups this item belongs to (multiselect) */
  groups: string[]
  req?: boolean
  url?: string
  /** limit to these trip motifs (empty/undefined = all) */
  mats?: string[]
  /** surface when the trip has activities in these categories (empty = any) */
  cats?: string[]
}
export interface ContentDoc {
  recs: PackRecItem[]
}

export interface ContentRepository {
  get(): Promise<ContentDoc>
  save(doc: ContentDoc): Promise<ContentDoc>
}

/** Starter templates, one row per template (data = a full trip document). */
export interface TemplateRepository {
  list(): Promise<TemplateTrip[]>
  get(id: string): Promise<TemplateTrip | null>
  upsert(tpl: TemplateTrip): Promise<TemplateTrip>
  remove(id: string): Promise<boolean>
}

/* ── Guides: curated destinations + places catalog ── */
export interface Destination {
  id: string
  slug: string
  name: string
  region: string
  heroImage?: string
  summary?: string
  bestTime?: string
  idealDuration?: string
  goodFor?: string[]
  tripTypes?: string[]
  tips?: string[]
  /** fuzzy-match a trip's free-text destination to this guide */
  aliases?: string[]
  /** template trip cloned by "Gunakan panduan untuk trip saya" */
  itineraryTemplateId?: string
  featured?: boolean
  published?: boolean
  sort?: number
}
export interface Place {
  id: string
  destinationId: string
  name: string
  /** hotel | makan | aktivitas | hidden_gem */
  type: string
  area?: string
  priceText?: string
  priceLevel?: number
  rating?: number
  ratingCount?: number
  tags?: string[]
  shortDesc?: string
  longDesc?: string
  /** self-hosted image URLs; [0] = cover */
  gallery?: string[]
  goodToKnow?: string[]
  tips?: string[]
  /** Google Maps reference — location only (deep link + coords), never images */
  gmapsPlaceId?: string
  lat?: number
  lng?: number
  openHours?: string
  url?: string
  badge?: string
  featured?: boolean
  sort?: number
}

export interface DestinationRepository {
  list(opts?: { region?: string; includeUnpublished?: boolean }): Promise<Destination[]>
  getBySlug(slug: string): Promise<Destination | null>
  getById(id: string): Promise<Destination | null>
  upsert(dest: Destination): Promise<Destination>
  remove(id: string): Promise<boolean>
}
export interface PlaceRepository {
  listByDestination(destinationId: string): Promise<Place[]>
  getById(id: string): Promise<Place | null>
  upsert(place: Place): Promise<Place>
  remove(id: string): Promise<boolean>
}

export interface SavedItem {
  kind: string
  refId: string
}
export interface SavedRepository {
  list(userId: string): Promise<SavedItem[]>
  add(userId: string, kind: string, refId: string): Promise<void>
  remove(userId: string, kind: string, refId: string): Promise<void>
}

export interface Repositories {
  trips: TripRepository
  content: ContentRepository
  templates: TemplateRepository
  destinations: DestinationRepository
  places: PlaceRepository
  saved: SavedRepository
}
