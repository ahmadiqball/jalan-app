<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp } from '~/utils/format'
import { budgetSummary } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()

const dayIdx = computed(() => Math.min(ui.dayIdx, Math.max(0, props.trip.days.length - 1)))
const day = computed(() => props.trip.days[dayIdx.value])
const sortedActs = computed(() =>
  (day.value?.acts || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99')),
)
const dayActCost = computed(() => (day.value?.acts || []).reduce((n, a) => n + a.cost, 0))
const dayTotal = computed(
  () =>
    dayActCost.value +
    (props.trip.manual || []).filter((m) => m.dayIdx === dayIdx.value).reduce((n, m) => n + m.amount, 0),
)
const summary = computed(() => budgetSummary(props.trip))
const dayPct = computed(() => (summary.value.spent ? Math.round((dayTotal.value / summary.value.spent) * 100) : 0))

function selectDay(i: number) {
  ui.dayIdx = i
  ui.showActForm = false
}
function addDay() {
  trips.patchTrip(props.trip.id, (t) => {
    t.days.push({ date: 'Hari ' + (t.days.length + 1), long: 'Hari ' + (t.days.length + 1), title: 'Belum diberi nama', outfit: '', acts: [] })
    return t
  })
  ui.dayIdx = props.trip.days.length - 1
}
function onSave(act: Parameters<typeof trips.addActivity>[2]) {
  trips.addActivity(props.trip.id, dayIdx.value, act)
  ui.showActForm = false
  flash('Aktivitas ditambahkan')
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
            {{ (day?.acts.length || 0) }} aktivitas · {{ rp(dayActCost) }} masuk anggaran
          </div>
        </div>
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[14px]" @click="ui.showActForm = !ui.showActForm">
          <i class="i-lucide-plus" /> Tambah aktivitas
        </CoreButton>
      </div>

      <DaysInlineForm v-if="ui.showActForm" @save="onSave" @cancel="ui.showActForm = false" />

      <template v-if="sortedActs.length">
        <DaysActivityRow
          v-for="a in sortedActs"
          :key="a.id"
          :act="a"
          :people="trip.people"
          :selected="ui.activityId === a.id"
        />
      </template>
      <DaysEmpty v-else-if="!ui.showActForm" @add="ui.showActForm = true" />
    </div>

    <div class="w-[300px] shrink-0 flex flex-col gap-4">
      <div class="card p-[18px]">
        <div class="eyebrow">Uang hari ini</div>
        <div class="flex items-baseline justify-between mt-2">
          <span class="text-[13px] text-muted">Terhitung</span>
          <span class="money text-[18px] font-600">{{ rp(dayTotal) }}</span>
        </div>
        <div class="mt-3">
          <CoreBar :pct="dayPct" />
        </div>
        <div class="text-[12.5px] text-muted mt-2">{{ dayPct }}% dari total terpakai sampai sekarang</div>
      </div>

      <DaysOutfitCard :trip="trip" :day-idx="dayIdx" />
    </div>
  </div>
</template>
