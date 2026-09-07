/** Whether the current user is an admin. Local mode → always true (dev user).
 *  Cloud mode → confirmed against /api/me (also refreshed by the cloud-sync
 *  plugin after sign-in; this re-check covers a missed/raced plugin refresh). */
export function useMe() {
  const cloud = useIsCloud()
  const isAdmin = useState<boolean>('me-admin', () => !cloud)

  if (import.meta.client && cloud) {
    const { apiFetch } = useApi()
    // re-check on mount (session is restored by then) — covers a missed/raced
    // plugin refresh, e.g. the menu mounting after the OAuth redirect.
    onMounted(async () => {
      try {
        isAdmin.value = (await apiFetch<{ isAdmin: boolean }>('/api/me')).isAdmin
      } catch {
        /* keep whatever we have */
      }
    })
  }

  return { isAdmin }
}
