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
  /** starter templates, each a full trip document (opaque here) */
  templates: TemplateTrip[]
  recs: PackRecItem[]
}

export interface ContentRepository {
  get(): Promise<ContentDoc>
  save(doc: ContentDoc): Promise<ContentDoc>
}

export interface Repositories {
  trips: TripRepository
  content: ContentRepository
}
