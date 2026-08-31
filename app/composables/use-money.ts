import { durLabel, rp, shortRp, timeRange } from '~/utils/format'

/** Formatting helpers surfaced as a composable for templates. */
export function useMoney() {
  return { rp, shortRp, durLabel, timeRange }
}
