import type { Trip } from '~/types/domain'
import { NO_PLAN, isTripActive, type Entitlement } from '#shared/utils/plans'

export interface MeResponse { isAdmin: boolean; subscription: Entitlement; lockedTripIds: string[] }

/**
 * The current user's plan, for gating the UI. The server enforces the same limits;
 * these checks just explain them before a change is rejected.
 */
export function useSubscription() {
  const sub = useState<Entitlement>('me-sub', () => NO_PLAN)
  const lockedIds = useState<string[]>('me-locked', () => [])
  const loaded = useState<boolean>('me-sub-loaded', () => false)
  const trips = useTripsStore()
  const session = useSessionStore()
  const localePath = useLocalePath()
  const { flash } = useToast()
  const { apiFetch } = useApi()

  const isOwn = (t: Pick<Trip, 'members'>) => tripRole(t, session.email) === 'owner'

  function apply(me: Pick<MeResponse, 'subscription' | 'lockedTripIds'>) {
    sub.value = me.subscription
    lockedIds.value = me.lockedTripIds
    loaded.value = true
  }
  async function refresh() {
    apply(await apiFetch<MeResponse>('/api/me'))
  }

  const isLocked = (id: string) => lockedIds.value.includes(id)
  const activeOwned = computed(() => trips.userTrips.filter((t) => isOwn(t) && isTripActive(t)).length)
  const canCreateTrip = computed(() => sub.value.maxTrips == null || activeOwned.value < sub.value.maxTrips)
  const canAddMember = (t: Pick<Trip, 'members'>) =>
    !isOwn(t) || sub.value.maxMembers == null || t.members.length < sub.value.maxMembers
  const canAddBudgetVersion = (t: Pick<Trip, 'members' | 'budgets'>) =>
    !isOwn(t) || sub.value.maxBudgetVersions == null || t.budgets.length < sub.value.maxBudgetVersions

  /** Send the user to the plans page with a reason. */
  function promptUpgrade(message: string) {
    flash(message)
    navigateTo(localePath('/langganan'))
  }
  /** True if a new trip fits the plan; otherwise explains and redirects. */
  function requireTripSlot(): boolean {
    if (canCreateTrip.value) return true
    promptUpgrade(sub.value.status === 'none' ? 'Pilih paket dulu untuk membuat trip' : `Paketmu hanya untuk ${sub.value.maxTrips} trip aktif`)
    return false
  }

  return { sub, loaded, apply, refresh, isLocked, canCreateTrip, canAddMember, canAddBudgetVersion, promptUpgrade, requireTripSlot }
}
