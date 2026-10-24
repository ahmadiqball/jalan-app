/** Client-side shapes for the Guides module (mirror the server domain). */
export interface Destination {
  id: string
  slug: string
  name: string
  region: string
  heroImage?: string
  cardImage?: string
  summary?: string
  bestTime?: string
  idealDuration?: string
  goodFor?: string[]
  tripTypes?: string[]
  tips?: string[]
  aliases?: string[]
  itineraryTemplateId?: string
  featured?: boolean
  published?: boolean
  sort?: number
}

export interface Place {
  id: string
  destinationId: string
  name: string
  type: string
  area?: string
  priceText?: string
  priceLevel?: number
  rating?: number
  ratingCount?: number
  tags?: string[]
  shortDesc?: string
  longDesc?: string
  gallery?: string[]
  goodToKnow?: string[]
  tips?: string[]
  gmapsPlaceId?: string
  lat?: number
  lng?: number
  openHours?: string
  url?: string
  badge?: string
  featured?: boolean
  sort?: number
}

/** destination with its places (GET /api/guides/:slug) */
export type GuideDetail = Destination & { places: Place[] }
/** place with parent context (GET /api/places/:id) */
export type PlaceDetail = Place & { destination: { slug: string; name: string } }
