import type { H3Event } from 'h3'
import type { Repositories } from '../repositories/types'
import { SupabaseTripRepository } from '../repositories/supabase/tripRepository'
import { SupabaseContentRepository } from '../repositories/supabase/contentRepository'
import { SupabaseTemplateRepository } from '../repositories/supabase/templateRepository'
import { SupabaseDestinationRepository } from '../repositories/supabase/destinationRepository'
import { SupabasePlaceRepository } from '../repositories/supabase/placeRepository'
import { SupabaseSavedRepository } from '../repositories/supabase/savedRepository'
import { SupabaseBillingRepository } from '../repositories/supabase/billingRepository'
import { useSupabase } from './supabase'

/** THE SINGLE DB SWAP POINT. Routes depend only on the Repositories interface. */
export function useRepositories(event: H3Event): Repositories {
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
