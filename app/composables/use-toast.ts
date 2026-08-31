import { useUiStore } from '~/stores/ui'

/** Thin wrapper over the ui store's toast. `flash(msg)` shows a 2200ms toast. */
export function useToast() {
  const ui = useUiStore()
  return {
    flash: (msg: string) => ui.flash(msg),
    toast: computed(() => ui.toast),
  }
}
