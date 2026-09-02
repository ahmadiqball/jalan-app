import type { H3Event } from 'h3'
import type { Repositories } from '../repositories/types'
import { SupabaseTripRepository } from '../repositories/supabase/tripRepository'
import { MemoryTripRepository } from '../repositories/memory/tripRepository'
import { cloudEnabled, useSupabase } from './supabase'

let memoryRepos: Repositories | null = null

/**
 * THE SINGLE DB SWAP POINT. Routes depend only on the Repositories interface.
 * Supabase when configured; otherwise an in-memory store (dev fallback, no
 * credentials required — the app still runs, just without cloud sync).
 */
export function useRepositories(event: H3Event): Repositories {
  if (cloudEnabled(event)) {
    return { trips: new SupabaseTripRepository(useSupabase(event)) }
  }
  if (!memoryRepos) memoryRepos = { trips: new MemoryTripRepository() }
  return memoryRepos
}
