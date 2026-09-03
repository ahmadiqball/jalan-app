/** Whether the current user is an admin. Local mode → always true (dev user).
 *  Cloud mode → set by the cloud-sync plugin after sign-in (via /api/me). */
export function useMe() {
  const cloud = useIsCloud()
  const isAdmin = useState<boolean>('me-admin', () => !cloud)
  return { isAdmin }
}
