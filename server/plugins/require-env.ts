/** Kelana always runs on Supabase, in dev too: fail at startup, not on the first request. */
export default defineNitroPlugin(() => {
  const cfg = useRuntimeConfig()
  const missing = [
    [cfg.supabaseUrl, 'NUXT_SUPABASE_URL'],
    [cfg.supabaseServiceKey, 'NUXT_SUPABASE_SERVICE_KEY'],
    [cfg.public.supabaseUrl, 'NUXT_PUBLIC_SUPABASE_URL'],
    [cfg.public.supabaseAnonKey, 'NUXT_PUBLIC_SUPABASE_ANON_KEY'],
  ].filter(([v]) => !v).map(([, k]) => k)
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}. See .env.example.`)
})
