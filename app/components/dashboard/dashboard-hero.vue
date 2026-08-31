<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { matDef } from '~/utils/motifs'
import { rp, shortRp } from '~/utils/format'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const { budget, packing } = useDerived(() => props.trip)

const mat = computed(() => matDef(props.trip.mat))
const typeLabel = computed(() => `${mat.value.label} · ${props.trip.people} orang`)

const dayIdx = computed(() => Math.min(ui.dayIdx, props.trip.days.length - 1))
const dayLabel = computed(() => `Hari ${dayIdx.value + 1} dari ${props.trip.days.length}`)

// two-tone progress: within-plan vs over
const bars = computed(() => {
  const { spent, plan } = budget.value
  const denom = Math.max(spent, plan, 1)
  const within = Math.min(spent, plan)
  const over = Math.max(0, spent - plan)
  return { a: (within / denom) * 100, b: (over / denom) * 100 }
})
const pctCopy = computed(() => Math.round(budget.value.pct) + '%')
const paceCopy = computed(() => (budget.value.over ? 'Sudah lewat rencana' : 'Masih di dalam rencana'))
const perHead = computed(() => rp(budget.value.perPerson))
const packReqCopy = computed(() =>
  packing.value.reqLeft > 0 ? `${packing.value.reqLeft} wajib belum dicentang` : 'Semua wajib sudah dicentang',
)

// next activity of the current day
const nextAct = computed(() => {
  const acts = (props.trip.days[dayIdx.value]?.acts || [])
    .slice()
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
  return acts.find((a) => a.cost > 0) || acts[0] || null
})
const nextActCopy = computed(() =>
  nextAct.value ? `${nextAct.value.time} · ${nextAct.value.title}` : 'Belum ada aktivitas hari ini',
)
const nextActSub = computed(() =>
  nextAct.value ? `${nextAct.value.cost ? shortRp(nextAct.value.cost) + ' · ' : ''}${nextAct.value.cat}` : '',
)

function open(tab: string) {
  navigateTo(`/trip/${props.trip.id}/${tab}`)
}
</script>

<template>
  <div class="bg-white border border-sand-line rounded-hero flex flex-wrap overflow-hidden shadow-card">
    <!-- media -->
    <div class="w-[392px] flex-[1_0_340px] min-h-[300px] relative">
      <CoreCover :mat="trip.mat" :photo="trip.cover" :photo-size="184" :photo-border="7">
        <template #badge>
          <span class="bg-white rounded-pill px-[13px] py-[7px] text-[12px] font-700 text-teal-700">
            {{ dayLabel }}
          </span>
        </template>
      </CoreCover>
    </div>

    <!-- content -->
    <div class="flex-1 min-w-[440px] p-[26px_28px] flex flex-col gap-[18px]">
      <div class="flex justify-between items-start gap-5">
        <div>
          <div class="flex gap-[9px] items-center">
            <CoreStatusPill status="live" />
            <span class="text-[13px] text-muted">{{ typeLabel }}</span>
          </div>
          <div class="font-display text-[30px] font-600 mt-[9px]">{{ trip.name }}</div>
          <div class="text-[14px] text-ink-2 mt-1">{{ trip.place }} · {{ trip.dates }}</div>
        </div>
        <div
          class="rounded-pill px-[15px] py-[9px] text-[13px] font-700 whitespace-nowrap money"
          :style="{ background: budget.statusBg, color: budget.statusFg }"
        >
          {{ budget.statusCopy }}
        </div>
      </div>

      <div class="flex gap-[14px] flex-wrap">
        <div class="flex-[1_1_190px] min-w-[190px] bg-paper rounded-card p-[16px_18px]">
          <div class="eyebrow">Terpakai</div>
          <div class="money text-[26px] font-600 mt-[6px]" :style="{ color: budget.statusFg }">{{ rp(budget.spent) }}</div>
          <div class="text-[13px] text-ink-2 mt-1 money">dari {{ rp(budget.plan) }}</div>
        </div>
        <div class="flex-[1_1_190px] min-w-[190px] bg-paper rounded-card p-[16px_18px]">
          <div class="eyebrow">Per orang</div>
          <div class="money text-[26px] font-600 mt-[6px]">{{ perHead }}</div>
          <div class="text-[13px] text-ink-2 mt-1">{{ trip.people }} orang</div>
        </div>
        <div class="flex-[1_1_190px] min-w-[190px] bg-paper rounded-card p-[16px_18px]">
          <div class="eyebrow">Barang</div>
          <div class="money text-[26px] font-600 mt-[6px]">{{ packing.done }} / {{ packing.total }}</div>
          <div class="text-[13px] text-ink-2 mt-1">{{ packReqCopy }}</div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="h-3 rounded-pill bg-sand-100 overflow-hidden flex">
          <div style="background:#F0713A" :style="{ width: bars.a + '%' }" />
          <div style="background:#C85A28" :style="{ width: bars.b + '%' }" />
        </div>
        <div class="flex justify-between text-[13px] text-muted">
          <span>{{ paceCopy }}</span>
          <span class="money">{{ pctCopy }}</span>
        </div>
      </div>

      <div class="mt-auto border-t border-sand-line pt-4 flex items-center gap-4 flex-wrap">
        <div class="w-[42px] h-[42px] shrink-0 rounded-full bg-warn-bg flex items-center justify-center text-warn-fg">
          <i class="i-lucide-clock text-[20px]" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[15px] font-600 truncate">{{ nextActCopy }}</div>
          <div class="text-[13px] text-muted mt-[2px] money">{{ nextActSub }}</div>
        </div>
        <div class="flex gap-[10px]">
          <CoreButton variant="primary" class="!px-[20px] !py-[11px] !text-[14px]" @click="open('expenses')">Catat pengeluaran</CoreButton>
          <CoreButton variant="teal" class="!bg-teal-100 !text-teal-700 !px-[20px] !py-[11px] !text-[14px] hover:!bg-teal-deep" @click="open('overview')">Buka trip</CoreButton>
        </div>
      </div>
    </div>
  </div>
</template>
