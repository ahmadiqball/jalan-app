<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp, shortRp } from '~/utils/format'
import { SEG_PALETTE } from '~/utils/categories'
import { expenseLines } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()

// Only compare the versions the user picks — otherwise 5+ versions overflow the
// table. Default: the active version plus up to two others; active stays on.
function defaults() {
  const ids = [props.trip.activeBudget]
  for (const b of props.trip.budgets) {
    if (b.id !== props.trip.activeBudget && ids.length < 3) ids.push(b.id)
  }
  return new Set(ids)
}
const shown = ref(defaults())
function toggle(id: string) {
  if (id === props.trip.activeBudget) return // active is always shown
  const next = new Set(shown.value)
  next.has(id) ? next.delete(id) : next.add(id)
  shown.value = next
}
const columns = computed(() => props.trip.budgets.filter((b) => shown.value.has(b.id)))

const cats = computed(() => {
  const set = new Set<string>()
  props.trip.budgets.forEach((b) => Object.keys(b.alloc).forEach((c) => set.add(c)))
  return [...set]
})
const spentByCat = computed(() => {
  const m: Record<string, number> = {}
  for (const l of expenseLines(props.trip)) m[l.cat] = (m[l.cat] || 0) + l.amount
  return m
})
const versionTotal = (b: Trip['budgets'][number]) => Object.values(b.alloc).reduce((n, v) => n + v, 0)
const spentTotal = computed(() => Object.values(spentByCat.value).reduce((n, v) => n + v, 0))
</script>

<template>
  <div class="card p-[20px_22px]">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="font-display text-[19px] font-600">Bandingkan versi per kategori</div>
    </div>

    <!-- version picker: choose which versions sit in the table -->
    <div v-if="trip.budgets.length > 1" class="flex items-center gap-2 flex-wrap mt-3">
      <span class="eyebrow mr-1">Bandingkan</span>
      <button
        v-for="b in trip.budgets"
        :key="b.id"
        class="rounded-pill px-[12px] py-[6px] text-[12.5px] font-600 border transition-colors"
        :class="shown.has(b.id)
          ? 'border-teal-600 bg-teal-100 text-teal-700'
          : 'border-sand-line text-muted hover:border-teal-600'"
        :title="b.id === trip.activeBudget ? 'Versi aktif selalu tampil' : ''"
        @click="toggle(b.id)"
      >
        {{ b.name }}
        <i v-if="b.id === trip.activeBudget" class="i-lucide-pin text-[12px] ml-[2px]" />
      </button>
    </div>

    <div class="overflow-x-auto mt-4">
      <table class="w-full border-collapse text-[13.5px]">
        <thead>
          <tr class="text-muted">
            <th class="text-left font-600 eyebrow !text-[11px] pb-2">Kategori</th>
            <th class="text-right font-600 eyebrow !text-[11px] pb-2 px-4">Terpakai</th>
            <th v-for="b in columns" :key="b.id" class="text-right font-600 pb-2 pl-4">
              <div :class="b.id === trip.activeBudget ? 'text-teal-700' : 'text-ink-2'">{{ b.name }}</div>
              <div class="text-[11px] text-muted font-500">{{ b.id === trip.activeBudget ? 'dipakai' : '' }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, ci) in cats" :key="c" class="border-t border-sand-100">
            <td class="py-[9px] text-left">
              <span class="inline-flex items-center gap-2">
                <span class="w-[9px] h-[9px] rounded-full" :style="{ background: SEG_PALETTE[ci % SEG_PALETTE.length]! }" />
                {{ c }}
              </span>
            </td>
            <td class="py-[9px] text-right money px-4 text-ink-2">{{ spentByCat[c] ? rp(spentByCat[c]) : '–' }}</td>
            <td
              v-for="b in columns"
              :key="b.id"
              class="py-[9px] text-right money pl-4"
              :style="(spentByCat[c] || 0) > (b.alloc[c] || 0) ? { background: '#FCE3D3', color: '#C85A28' } : {}"
            >
              {{ b.alloc[c] ? rp(b.alloc[c]) : '–' }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-sand-line">
            <td class="py-[11px] font-700">Total versi</td>
            <td class="py-[11px] text-right money px-4">{{ spentTotal ? rp(spentTotal) : '–' }}</td>
            <td v-for="b in columns" :key="b.id" class="py-[11px] text-right pl-4">
              <div class="money font-700">{{ rp(versionTotal(b)) }}</div>
              <div class="text-[11px] text-muted money">sisa {{ shortRp(Math.max(0, versionTotal(b) - spentTotal)) }}</div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
