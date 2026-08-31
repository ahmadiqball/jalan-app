<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp, shortRp } from '~/utils/format'
import { SHORT_CAT } from '~/utils/categories'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const { budget, categories, lines, packing, warnings } = useDerived(() => props.trip)

const dayIdx = computed(() => Math.min(ui.dayIdx, props.trip.days.length - 1))
const nextAct = computed(() => {
  const acts = (props.trip.days[dayIdx.value]?.acts || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
  return acts.find((a) => a.cost > 0) || acts[0] || null
})
const recent = computed(() => lines.value.slice().sort((a, b) => b.dayIdx - a.dayIdx).slice(0, 4))
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <!-- main -->
    <div class="flex-1 min-w-0 flex flex-col gap-5">
      <div class="card p-[20px_22px]">
        <div class="flex items-start justify-between">
          <div class="eyebrow">Terpakai sampai hari ini</div>
          <span class="rounded-pill px-[11px] py-[5px] text-[12px] font-700" :style="{ background: budget.statusBg, color: budget.statusFg }">{{ budget.statusCopy }}</span>
        </div>
        <div class="money text-[34px] font-600 mt-1" :style="{ color: budget.statusFg }">{{ rp(budget.spent) }}</div>
        <div class="text-[13.5px] text-muted mt-1 money">dari rencana {{ rp(budget.plan) }} · {{ rp(budget.perPerson) }} per orang</div>
        <div class="mt-3"><CoreBar :pct="budget.pct" :over="budget.over" /></div>

        <div class="grid gap-3 mt-4" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
          <div v-for="c in categories" :key="c.name" class="bg-paper rounded-field p-[12px_14px]">
            <div class="text-[12.5px] text-muted truncate">{{ SHORT_CAT[c.name] || c.name }}</div>
            <div class="money text-[16px] font-600 mt-[2px]" :style="{ color: c.spentFg }">{{ c.spentShort }}</div>
            <div class="mt-2"><CoreBar :pct="c.pct" :color="c.barColor" :height="6" /></div>
          </div>
        </div>
      </div>

      <div v-if="warnings.length" class="card p-[18px_20px]">
        <div class="font-display text-[17px] font-600">Perlu diperhatikan</div>
        <ul class="flex flex-col gap-2 mt-3">
          <li v-for="(w, i) in warnings" :key="i" class="flex items-start gap-2 text-[13.5px] text-ink-2">
            <i class="i-lucide-alert-circle text-warn-fg text-[16px] mt-[1px] shrink-0" />
            <span>{{ w }}</span>
          </li>
        </ul>
      </div>

      <div class="card p-[18px_20px]">
        <div class="flex items-center justify-between">
          <div class="font-display text-[17px] font-600">Hari</div>
          <NuxtLink :to="`/trip/${trip.id}/days`" class="text-[13px] font-600 text-teal-600">Buka perencana</NuxtLink>
        </div>
        <div class="grid gap-2 mt-3" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
          <NuxtLink
            v-for="(d, i) in trip.days"
            :key="i"
            :to="`/trip/${trip.id}/days`"
            class="rounded-field p-[10px_12px] border transition-colors"
            :class="i === dayIdx ? 'border-teal-600' : 'border-sand-line hover:bg-sand-100'"
            :style="i === dayIdx ? { background: '#DEEEEC' } : {}"
            @click="ui.dayIdx = i"
          >
            <div class="money text-[12px] text-muted">{{ d.date }}</div>
            <div class="text-[13.5px] font-600 truncate mt-[2px]">{{ d.title || 'Belum diberi nama' }}</div>
            <div class="text-[11.5px] text-muted mt-[2px]">{{ d.acts.length }} aktivitas</div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- rail -->
    <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
      <div class="card p-[18px]">
        <div class="font-display text-[17px] font-600">Berikutnya</div>
        <div v-if="nextAct" class="mt-2">
          <div class="text-[14px] font-600">{{ nextAct.time }} · {{ nextAct.title }}</div>
          <div class="text-[12.5px] text-muted mt-[2px] money">{{ nextAct.cost ? shortRp(nextAct.cost) + ' · ' : '' }}{{ nextAct.cat }}</div>
        </div>
        <div v-else class="text-[13px] text-muted mt-2">Belum ada aktivitas hari ini.</div>
        <NuxtLink :to="`/trip/${trip.id}/days`">
          <div class="mt-3 bg-teal-100 text-teal-700 rounded-field text-center py-[10px] text-[13.5px] font-600">Lihat hari ini</div>
        </NuxtLink>
      </div>

      <div class="card p-[18px]">
        <div class="flex items-center justify-between">
          <div class="font-display text-[17px] font-600">Pengeluaran terakhir</div>
          <NuxtLink :to="`/trip/${trip.id}/expenses`" class="text-[13px] font-600 text-teal-600">Semua</NuxtLink>
        </div>
        <div class="flex flex-col gap-2 mt-3">
          <div v-for="l in recent" :key="l.id" class="flex items-center justify-between gap-2">
            <span class="text-[13px] text-ink-2 truncate">{{ l.title }}</span>
            <span class="money text-[13px] font-600 shrink-0">{{ rp(l.amount) }}</span>
          </div>
          <div v-if="!recent.length" class="text-[13px] text-muted">Belum ada pengeluaran.</div>
        </div>
      </div>

      <div class="card p-[18px]">
        <div class="flex items-center justify-between">
          <div class="font-display text-[17px] font-600">Barang bawaan</div>
          <span class="money text-[13px] text-muted">{{ packing.done }} / {{ packing.total }}</span>
        </div>
        <div class="mt-3"><CoreBar :pct="packing.total ? (packing.done / packing.total) * 100 : 0" :color="'#2F6B54'" /></div>
        <div class="text-[12.5px] text-muted mt-2">
          {{ packing.reqLeft > 0 ? packing.reqLeft + ' wajib belum dicentang' : 'Semua wajib sudah dicentang' }}
        </div>
      </div>
    </div>
  </div>
</template>
