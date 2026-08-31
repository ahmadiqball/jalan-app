import { clsx, type ClassValue } from 'clsx'

/**
 * Compose conditional class strings. Thin wrapper over clsx.
 * No tailwind-merge — we run UnoCSS, and Vue's :class handles most conditionals
 * natively; use this only when composing utility strings passed to primitives.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
