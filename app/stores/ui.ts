import { defineStore } from 'pinia'

/**
 * Transient UI state — overlays, drafts, selection, toast. NOT persisted.
 * Route and active tab come from the URL, not here.
 */
export const useUiStore = defineStore('ui', () => {
  // selection
  const dayIdx = ref(2)
  const activityId = ref<string | null>(null)
  const homeFilter = ref<'Semua' | 'Sedang jalan' | 'Rencana'>('Semua')
  const openCat = ref<string | null>('Makan & minum')
  const openScope = ref<string | null>(null)

  // overlays
  const showNewTrip = ref(false)
  const showActForm = ref(false)
  const editOpen = ref(false)

  // toast
  const toast = ref<string | null>(null)
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  function flash(msg: string) {
    toast.value = msg
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = null), 2200)
  }

  function selectActivity(id: string | null) {
    activityId.value = id
  }

  return {
    dayIdx, activityId, homeFilter, openCat, openScope,
    showNewTrip, showActForm, editOpen,
    toast, flash, selectActivity,
  }
})
