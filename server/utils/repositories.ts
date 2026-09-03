import type { H3Event } from 'h3'
import type { Repositories } from '../repositories/types'
import { SupabaseTripRepository } from '../repositories/supabase/tripRepository'
import { MemoryTripRepository } from '../repositories/memory/tripRepository'
import { SupabaseContentRepository } from '../repositories/supabase/contentRepository'
import { MemoryContentRepository } from '../repositories/memory/contentRepository'
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
    return { trips: new SupabaseTripRepository(sb), content: new SupabaseContentRepository(sb) }
  }
  if (!memoryRepos) memoryRepos = { trips: new MemoryTripRepository(), content: new MemoryContentRepository() }
  return memoryRepos
}
