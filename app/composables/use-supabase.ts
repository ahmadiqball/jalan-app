import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/** Singleton browser Supabase client (auth only). null on the server. */
export function useSupabaseClient(): SupabaseClient | null {
  if (import.meta.server) return null
  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl as string
  const key = cfg.public.supabaseAnonKey as string
  if (!url || !key) return null
  if (!_client) _client = createClient(url, key)
  return _client
}
