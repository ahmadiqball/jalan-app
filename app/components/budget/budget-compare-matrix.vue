<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp, shortRp } from '~/utils/format'
import { SEG_PALETTE } from '~/utils/categories'
import { expenseLines } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()

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
    <div class="font-display text-[19px] font-600">Bandingkan versi per kategori</div>
    <div class="overflow-x-auto mt-4">
      <table class="w-full border-collapse text-[13.5px]">
        <thead>
          <tr class="text-muted">
            <th class="text-left font-600 eyebrow !text-[11px] pb-2">Kategori</th>
            <th class="text-right font-600 eyebrow !text-[11px] pb-2 px-4">Terpakai</th>
            <th v-for="b in trip.budgets" :key="b.id" class="text-right font-600 pb-2 pl-4">
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
              v-for="b in trip.budgets"
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
            <td v-for="b in trip.budgets" :key="b.id" class="py-[11px] text-right pl-4">
              <div class="money font-700">{{ rp(versionTotal(b)) }}</div>
              <div class="text-[11px] text-muted money">sisa {{ shortRp(Math.max(0, versionTotal(b) - spentTotal)) }}</div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
