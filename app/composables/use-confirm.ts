/**
 * Global confirm dialog. Any component can `await confirm({...})` and get a
 * boolean. A single <CoreConfirm> mounted in the layout renders the pending
 * request; the resolver lives module-side (client-only interaction).
 */
export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** red confirm button for irreversible/destructive actions */
  danger?: boolean
}

let resolver: ((v: boolean) => void) | null = null

export function useConfirm() {
  const current = useState<ConfirmOptions | null>('confirm-current', () => null)

  function confirm(opts: ConfirmOptions): Promise<boolean> {
    // resolve any dialog already open as cancelled before opening a new one
    resolver?.(false)
    current.value = opts
    return new Promise<boolean>((res) => { resolver = res })
  }

  function resolve(v: boolean) {
    current.value = null
    resolver?.(v)
    resolver = null
  }

  return { current, confirm, resolve }
}
