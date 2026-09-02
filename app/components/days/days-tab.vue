<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp, toMin, fromMin } from '~/utils/format'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()

const dayIdx = computed(() => Math.min(ui.dayIdx, Math.max(0, props.trip.days.length - 1)))
const day = computed(() => props.trip.days[dayIdx.value])
const sortedActs = computed(() =>
  (day.value?.acts || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99')),
)
const dayPlanned = computed(() => (day.value?.acts || []).reduce((n, a) => n + a.cost, 0))
const daySpent = computed(
  () =>
    (day.value?.acts || []).reduce((n, a) => n + (a.paid ? a.cost : 0), 0) +
    (props.trip.manual || []).filter((m) => m.dayIdx === dayIdx.value).reduce((n, m) => n + m.amount, 0),
)
const dayPct = computed(() =>
  dayPlanned.value ? Math.min(100, (daySpent.value / dayPlanned.value) * 100) : daySpent.value ? 100 : 0,
)
const dayOver = computed(() => daySpent.value > dayPlanned.value && dayPlanned.value > 0)

/** timeline: activities with gap markers between them */
const timeline = computed(() => {
  const items: ({ type: 'act'; act: (typeof sortedActs.value)[number] } | { type: 'gap'; from: string; to: string } | { type: 'link' })[] = []
  const acts = sortedActs.value
  acts.forEach((a, i) => {
    items.push({ type: 'act', act: a })
    const next = acts[i + 1]
    if (!next) return
    const end = a.time ? (toMin(a.time) || 0) + (a.dur || 0) : null
    const start = next.time ? toMin(next.time) : null
    if (end != null && start != null && start - end >= 15) {
      items.push({ type: 'gap', from: fromMin(end), to: fromMin(start) })
    } else {
      items.push({ type: 'link' })
    }
  })
  return items
})

function selectDay(i: number) {
  ui.dayIdx = i
}
function addDay() {
  trips.patchTrip(props.trip.id, (t) => {
    t.days.push({ date: 'Hari ' + (t.days.length + 1), long: 'Hari ' + (t.days.length + 1), title: 'Belum diberi nama', outfit: '', acts: [] })
    return t
  })
  ui.dayIdx = props.trip.days.length - 1
}
/** create a blank activity and open the slide-over to edit it */
function addAndOpen(time = '') {
  const id = trips.addActivity(props.trip.id, dayIdx.value, {
    time, title: '', cat: 'Transport', place: '', cost: 0, dur: 60, note: '',
  })
  ui.selectActivity(id)
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <DaysRail :days="trip.days" :selected="dayIdx" @select="selectDay" @add="addDay" />

    <div class="flex-1 min-w-0 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div class="font-display text-[24px] font-600">{{ day?.long }}</div>
          <div class="text-[13.5px] text-muted mt-[2px]">
            {{ (day?.acts.length || 0) }} aktivitas · {{ rp(dayPlanned) }} masuk anggaran
          </div>
        </div>
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[14px]" @click="addAndOpen()">
          <i class="i-lucide-plus" /> Tambah aktivitas
        </CoreButton>
      </div>

      <template v-if="sortedActs.length">
        <div class="flex flex-col gap-2">
          <template v-for="(it, i) in timeline" :key="i">
            <DaysActivityRow
              v-if="it.type === 'act'"
              :act="it.act"
              :people="trip.people"
              :selected="ui.activityId === it.act.id"
            />
            <!-- connector -->
            <div v-else-if="it.type === 'link'" class="ml-[26px] h-[10px] w-0 border-l-2 border-sand-line" />
            <!-- empty time-gap -->
            <button
              v-else
              class="ml-[10px] flex items-center gap-3 text-left group"
              @click="addAndOpen(it.from)"
            >
              <span class="w-[32px] border-l-2 border-dashed border-sand-line3 h-[34px]" />
              <span class="flex items-center gap-2 rounded-field border border-dashed border-sand-line3 px-[13px] py-[9px] text-[12.5px] text-muted group-hover:border-teal-600 group-hover:text-teal-700 transition-colors">
                <span class="money">{{ it.from }}–{{ it.to }}</span> waktu kosong
                <span class="font-600 text-teal-600 group-hover:text-teal-700">+ Isi</span>
              </span>
            </button>
          </template>
        </div>
      </template>
      <DaysEmpty v-else @add="addAndOpen()" />
    </div>

    <div class="w-full md:w-[300px] md:shrink-0 flex flex-col gap-4">
      <NuxtLink :to="`/trip/${trip.id}/expenses`" class="card p-[18px] block hover:shadow-lift transition-shadow">
        <div class="flex items-center justify-between">
          <div class="eyebrow">Uang hari ini</div>
          <i class="i-lucide-arrow-up-right text-[16px] text-muted" />
        </div>
        <div class="flex items-baseline justify-between mt-2">
          <span class="text-[13px] text-muted">Terpakai</span>
          <span class="money text-[18px] font-600" :style="dayOver ? { color: '#C85A28' } : {}">{{ rp(daySpent) }}</span>
        </div>
        <div class="mt-3"><CoreBar :pct="dayPct" :over="dayOver" /></div>
        <div class="text-[12.5px] text-muted mt-2 money">Rencana hari ini {{ rp(dayPlanned) }}</div>
      </NuxtLink>

      <DaysOutfitCard :trip="trip" :day-idx="dayIdx" />
    </div>
  </div>
</template>
