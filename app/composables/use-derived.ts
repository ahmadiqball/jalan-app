import type { MaybeRefOrGetter } from 'vue'
import type { Trip } from '~/types/domain'
import {
  budgetSummary,
  categoryRows,
  donutStops,
  expenseLines,
  looseCategories,
  packingProgress,
  tripWarnings,
} from '~/utils/derive'

/** Reactive derived data for a trip. Pass a ref/getter that yields the trip. */
export function useDerived(trip: MaybeRefOrGetter<Trip>) {
  const t = () => toValue(trip)
  return {
    lines: computed(() => expenseLines(t())),
    budget: computed(() => budgetSummary(t())),
    categories: computed(() => categoryRows(t())),
    donut: computed(() => donutStops(t())),
    loose: computed(() => looseCategories(t())),
    packing: computed(() => packingProgress(t())),
    warnings: computed(() => tripWarnings(t())),
  }
}
