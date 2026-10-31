/**
 * Guide data: the cached public route renders on the server, then plans that
 * include guides swap in the uncached member route once the plan is known.
 */
export function useGuideResource<T>(publicPath: () => string, memberPath: () => string, key: string) {
  const { data: pub, error: pubError, status: pubStatus } = useFetch<T>(publicPath, { key, lazy: true, getCachedData: payloadCache })
  const { sub, loaded } = useSubscription()
  const session = useSessionStore()
  const { apiFetch } = useApi()

  const member = shallowRef<T | null>(null)
  const memberPending = ref(false)
  async function loadMember() {
    if (!sub.value.guides) { member.value = null; return }
    memberPending.value = true
    try {
      member.value = await apiFetch<T>(memberPath())
    } catch {
      member.value = null
    } finally {
      memberPending.value = false
    }
  }
  onMounted(() => watch([() => sub.value.guides, memberPath], loadMember, { immediate: true }))

  const data = computed(() => member.value ?? pub.value)
  const error = computed(() => (member.value ? null : pubError.value))
  // a paid guide 404s publicly, so hold off until the plan has been checked
  const waitingForPlan = computed(() => !!pubError.value && session.authed && !loaded.value)
  const status = computed(() => (memberPending.value || waitingForPlan.value ? 'pending' : pubStatus.value))
  return { data, error, status }
}
