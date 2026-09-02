type ApiOpts = { method?: string; body?: unknown; headers?: Record<string, string> }

/** $fetch wrapper that attaches the Supabase bearer token in cloud mode. */
export function useApi() {
  const client = useSupabaseClient()

  async function authHeader(): Promise<Record<string, string>> {
    if (!client) return {}
    const { data } = await client.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function apiFetch<T>(path: string, opts: ApiOpts = {}): Promise<T> {
    const headers = { ...(opts.headers || {}), ...(await authHeader()) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return $fetch(path, { ...opts, headers } as any) as Promise<T>
  }

  return { apiFetch }
}
