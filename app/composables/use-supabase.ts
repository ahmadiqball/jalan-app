import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/** Cloud mode = client Supabase creds are configured. */
export function useIsCloud(): boolean {
  const cfg = useRuntimeConfig()
  return !!(cfg.public.supabaseUrl && cfg.public.supabaseAnonKey)
}

/** Singleton browser Supabase client (auth only). null in local mode / on server. */
export function useSupabaseClient(): SupabaseClient | null {
  if (import.meta.server) return null
  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl as string
  const key = cfg.public.supabaseAnonKey as string
  if (!url || !key) return null
  if (!_client) _client = createClient(url, key)
  return _client
}
