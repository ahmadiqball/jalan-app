import { defineStore } from 'pinia'

/**
 * Transient UI state. Most of this is NOT persisted (overlays, drafts, toast).
 * `smokeCount` here only exists to verify persistence wiring in Phase 0 and
 * will be removed once real stores land.
 */
export const useUiStore = defineStore(
  'ui',
  () => {
    const smokeCount = ref(0)
    const bump = () => (smokeCount.value += 1)
    return { smokeCount, bump }
  },
  {
    persist: true,
  },
)
