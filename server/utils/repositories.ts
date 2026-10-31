import type { H3Event } from 'h3'
import type { Repositories } from '../repositories/types'
import { SupabaseTripRepository } from '../repositories/supabase/tripRepository'
import { MemoryTripRepository } from '../repositories/memory/tripRepository'
import { SupabaseContentRepository } from '../repositories/supabase/contentRepository'
import { MemoryContentRepository } from '../repositories/memory/contentRepository'
import { SupabaseTemplateRepository } from '../repositories/supabase/templateRepository'
import { MemoryTemplateRepository } from '../repositories/memory/templateRepository'
import { SupabaseDestinationRepository } from '../repositories/supabase/destinationRepository'
import { MemoryDestinationRepository } from '../repositories/memory/destinationRepository'
import { SupabasePlaceRepository } from '../repositories/supabase/placeRepository'
import { MemoryPlaceRepository } from '../repositories/memory/placeRepository'
import { SupabaseSavedRepository } from '../repositories/supabase/savedRepository'
import { MemorySavedRepository } from '../repositories/memory/savedRepository'
import { SupabaseBillingRepository } from '../repositories/supabase/billingRepository'
import { MemoryBillingRepository } from '../repositories/memory/billingRepository'
import { cloudEnabled, useSupabase } from './supabase'

let memoryRepos: Repositories | null = null

/**
 * THE SINGLE DB SWAP POINT. Routes depend only on the Repositories interface.
 * Supabase when configured; otherwise an in-memory store (dev fallback, no
 * credentials required — the app still runs, just without cloud sync).
 */
export function useRepositories(event: H3Event): Repositories {
  if (cloudEnabled(event)) {
    const sb = useSupabase(event)
    return {
      trips: new SupabaseTripRepository(sb),
      content: new SupabaseContentRepository(sb),
      templates: new SupabaseTemplateRepository(sb),
      destinations: new SupabaseDestinationRepository(sb),
      places: new SupabasePlaceRepository(sb),
      saved: new SupabaseSavedRepository(sb),
      billing: new SupabaseBillingRepository(sb),
    }
  }
  if (!memoryRepos)
    memoryRepos = {
      trips: new MemoryTripRepository(),
      content: new MemoryContentRepository(),
      templates: new MemoryTemplateRepository(),
      destinations: new MemoryDestinationRepository(),
      places: new MemoryPlaceRepository(),
      saved: new MemorySavedRepository(),
      billing: new MemoryBillingRepository(),
    }
  return memoryRepos
}
