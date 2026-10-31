<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp, shortRp, toMin, fromMin } from '~/utils/format'
import { budgetCatOf, catIcon, catLabel, tone } from '~/utils/categories'
import { planRows } from '~/utils/derive'

const props = withDefaults(defineProps<{ trip: Trip; template?: boolean }>(), { template: false })
const ui = useUiStore()
const trips = useTripsStore()
const { confirm } = useConfirm()
const { t } = useI18n()
const { flash } = useToast()
const { budget } = useDerived(() => props.trip)
const catPlans = computed(() => planRows(props.trip))
const tripPlanned = computed(() => catPlans.value.reduce((n, r) => n + r.planned, 0))
const tripPlanOver = computed(() => tripPlanned.value > budget.value.plan)
const tripPlanPct = computed(() => (budget.value.plan ? (tripPlanned.value / budget.value.plan) * 100 : 0))
const sumView = ref<'trip' | 'today'>('trip')

/* keep the day rail + header pinned below the app's sticky top bar (68px) and
 * the sticky trip header, whose height varies with content — measure it. */
const TOPBAR = 68
const stickyTop = ref(TOPBAR + 168)
let ro: ResizeObserver | null = null
function measureSticky() {
  // mobile: the trip header is static (scrolls away), so day controls pin right
  // under the app bar. desktop: the trip header is sticky, so pin below it.
  if (!window.matchMedia('(min-width: 768px)').matches) { stickyTop.value = TOPBAR; return }
  const el = document.querySelector('[data-trip-header]') as HTMLElement | null
  stickyTop.value = TOPBAR + (el?.offsetHeight ?? 168)
}
onMounted(() => {
  measureSticky()
  const el = document.querySelector('[data-trip-header]')
  if (el && 'ResizeObserver' in window) { ro = new ResizeObserver(measureSticky); ro.observe(el) }
  window.addEventListener('resize', measureSticky)
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('resize', measureSticky)
})

const dayIdx = computed(() => Math.min(ui.dayIdx, Math.max(0, props.trip.days.length - 1)))
const day = computed(() => props.trip.days[dayIdx.value])
// treat the legacy auto-placeholder as "no name"
const dayName = computed(() => {
  const t = day.value?.title || ''
  return t === 'Belum diberi nama' ? '' : t
})
const sortedActs = computed(() =>
  (day.value?.acts || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99')),
)
// activity stops with a location, in time order — feeds the day route map
const dayPlaces = computed(() =>
  sortedActs.value
    .filter((a) => a.place?.trim())
    .map((a) => ({ label: a.title || a.place, name: a.place, placeId: a.placeId })),
)
// default start for a new activity = end of the day's last (latest) activity
const nextStart = computed(() => {
  const timed = sortedActs.value.filter((a) => a.time)
  const last = timed[timed.length - 1]
  if (!last) return ''
  return fromMin((toMin(last.time) || 0) + (last.dur || 0))
})
const dayPlanned = computed(() => (day.value?.acts || []).reduce((n, a) => n + a.cost, 0))
const daySpent = computed(
  () =>
    (day.value?.acts || []).reduce((n, a) => n + (a.paid ? (a.actual ?? a.cost) : 0), 0) +
    (props.trip.manual || []).filter((m) => m.dayIdx === dayIdx.value).reduce((n, m) => n + m.amount, 0),
)
const dayOver = computed(() => daySpent.value > dayPlanned.value && dayPlanned.value > 0)
/** the day's planned activity costs grouped by budget category */
const dayCatRows = computed(() => {
  const map = new Map<string, number>()
  for (const a of day.value?.acts || []) {
    if (!a.cost) continue
    const k = budgetCatOf(a.cat)
    map.set(k, (map.get(k) || 0) + a.cost)
  }
  return [...map.entries()]
    .map(([name, planned]) => ({ name, planned, icon: catIcon(props.trip.catIcons, name), tone: tone(name) }))
    .sort((a, b) => b.planned - a.planned)
})

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
    t.days.push({ date: 'Hari ' + (t.days.length + 1), long: 'Hari ' + (t.days.length + 1), title: '', outfit: '', acts: [] })
    return t
  })
  ui.dayIdx = props.trip.days.length - 1
}
function setTitle(v: string) {
  trips.setDayTitle(props.trip.id, dayIdx.value, v)
}
/** create a blank activity and open the slide-over to edit it */
function addAndOpen(time = '') {
  const id = trips.addActivity(props.trip.id, dayIdx.value, {
    time, title: '', cat: 'Transport', place: '', cost: 0, dur: 60, note: '',
  })
  ui.selectActivity(id)
}
/** delete the current day — confirm only when it already has activities */
async function removeCurrentDay() {
  if (props.trip.days.length <= 1) return
  const d = day.value
  const n = d?.acts.length || 0
  if (n > 0) {
    const ok = await confirm({
      title: t('confirm.delDayTitle'),
      message: t('confirm.delDayMsg', { day: d?.long || d?.date || '', n }),
      confirmLabel: t('confirm.delDayCta'),
      danger: true,
    })
    if (!ok) return
  }
  const idx = dayIdx.value
  trips.removeDay(props.trip.id, idx)
  ui.dayIdx = Math.min(idx, props.trip.days.length - 1)
  flash('Hari dihapus')
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <DaysRail :days="trip.days" :selected="dayIdx" :sticky-top="stickyTop" @select="selectDay" @add="addDay" />

    <div class="flex-1 min-w-0 flex flex-col gap-3">
      <div class="sticky z-20 bg-paper -mx-1 px-1 pt-1 pb-[10px] flex items-center justify-between gap-3 flex-wrap border-b border-transparent" :style="{ top: stickyTop + 'px' }">
        <div class="min-w-0">
          <div class="font-display text-[24px] font-600">{{ day?.long }}</div>
          <input
            :value="dayName"
            placeholder="+ Beri nama hari (opsional)"
            class="mt-[3px] text-[14px] font-600 text-ink-2 bg-transparent border-b border-transparent hover:border-sand-line focus:border-teal-600 outline-none w-full max-w-[300px] placeholder:font-500 placeholder:text-muted"
            @input="setTitle(($event.target as HTMLInputElement).value)"
          >
          <div class="text-[13.5px] text-muted mt-[2px]">
            {{ (day?.acts.length || 0) }} aktivitas
          </div>
        </div>
        <div class="flex items-center gap-2 shrink min-w-0 justify-end flex-wrap">
          <!-- today's money at a glance, kept visible while the list scrolls -->
          <div
            v-if="dayPlanned > 0 || daySpent > 0"
            class="flex items-baseline gap-[6px] rounded-pill bg-white border border-sand-line px-[11px] py-[7px] min-w-0"
            title="Uang hari ini"
          >
            <i class="i-lucide-wallet text-[13px] shrink-0 self-center" :class="dayOver ? 'text-warn-fg' : 'text-teal-700'" />
            <span class="money text-[13.5px] font-700" :class="dayOver ? 'text-warn-fg' : 'text-ink'">{{ rp(daySpent) }}</span>
            <span class="money text-[12px] text-muted">/ {{ rp(dayPlanned) }}</span>
          </div>
          <button
            v-if="trip.days.length > 1"
            class="w-[38px] h-[38px] shrink-0 rounded-full border border-sand-line2 text-muted hover:text-warn-fg hover:border-warn-fg flex items-center justify-center transition-colors"
            title="Hapus hari ini"
            aria-label="Hapus hari ini"
            @click="removeCurrentDay"
          >
            <i class="i-lucide-trash-2 text-[16px]" />
          </button>
          <CoreButton variant="primary" class="!px-[13px] sm:!px-[18px] !py-[10px] !text-[14px] shrink-0" @click="addAndOpen(nextStart)">
            <i class="i-lucide-plus" /> <span class="hidden sm:inline">Tambah aktivitas</span>
          </CoreButton>
        </div>
      </div>

      <template v-if="sortedActs.length">
        <div class="flex flex-col gap-2">
          <template v-for="(it, i) in timeline" :key="i">
            <DaysActivityRow
              v-if="it.type === 'act'"
              :act="it.act"
              :trip-id="trip.id"
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
      <DaysEmpty v-else @add="addAndOpen(nextStart)" />
    </div>

    <div v-if="!template" class="w-full md:w-[300px] md:shrink-0 flex flex-col gap-4">
      <div class="card p-[18px] flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="font-display text-[16px] font-600">Ringkasan anggaran</div>
          <div class="flex items-center gap-[2px] bg-sand-100 rounded-pill p-[3px] text-[12px] font-700 shrink-0">
            <button class="rounded-pill px-[11px] py-[5px] transition-colors" :class="sumView === 'today' ? 'bg-white text-ink shadow-[0_1px_3px_rgba(16,38,43,.14)]' : 'text-muted'" @click="sumView = 'today'">Hari ini</button>
            <button class="rounded-pill px-[11px] py-[5px] transition-colors" :class="sumView === 'trip' ? 'bg-teal-600 text-white' : 'text-muted'" @click="sumView = 'trip'">Total trip</button>
          </div>
        </div>

        <!-- TOTAL TRIP -->
        <template v-if="sumView === 'trip'">
          <div class="grid grid-cols-3 gap-2">
            <div><div class="text-[11px] text-muted">Terpakai</div><div class="money text-[14.5px] font-700" :class="tripPlanOver ? 'text-warn-fg' : ''">{{ shortRp(tripPlanned) }}</div></div>
            <div><div class="text-[11px] text-muted">Anggaran</div><div class="money text-[14.5px] font-700">{{ shortRp(budget.plan) }}</div></div>
            <div><div class="text-[11px] text-muted">{{ tripPlanOver ? 'Lewat' : 'Sisa' }}</div><div class="money text-[14.5px] font-700" :class="tripPlanOver ? 'text-warn-fg' : 'text-teal-700'">{{ shortRp(Math.abs(budget.plan - tripPlanned)) }}</div></div>
          </div>
          <div v-if="budget.plan">
            <CoreBar :pct="tripPlanPct" :over="tripPlanOver" />
            <div class="text-[11.5px] text-muted mt-1 text-right money">{{ Math.round(tripPlanPct) }}% terpakai</div>
          </div>

          <div v-if="catPlans.length" class="flex flex-col gap-[10px] pt-1">
            <div class="eyebrow">Rencana per kategori</div>
            <div v-for="c in catPlans" :key="c.name" class="flex items-start gap-2">
              <span class="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center shrink-0" :style="{ background: tone(c.name)[0], color: tone(c.name)[1] }"><i :class="catIcon(trip.catIcons, c.name)" class="text-[12px]" /></span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[12.5px] text-ink-2 truncate">{{ catLabel(c.name) }}</span>
                  <span class="money text-[12px] font-600 shrink-0">{{ rp(c.planned) }}</span>
                </div>
                <div v-if="c.alloc" class="h-[5px] rounded-pill bg-sand-100 mt-[3px] overflow-hidden"><div class="h-full rounded-pill" :style="{ width: c.pct + '%', background: c.barColor }" /></div>
                <div class="flex items-center justify-between gap-2 mt-[3px] text-[11px] leading-tight">
                  <span class="text-muted"><template v-if="c.alloc">dari <span class="money">{{ rp(c.alloc) }}</span></template></span>
                  <span class="font-600 shrink-0" :class="c.over || !c.alloc ? 'text-warn-fg' : 'text-teal-700'">{{ c.leftCopy }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-sand-100 pt-3 mt-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[12.5px] font-700 truncate">{{ day?.long }}<span v-if="dayName" class="text-muted font-500"> · {{ dayName }}</span></span>
              <button class="text-[12px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1 shrink-0" @click="sumView = 'today'">Lihat detail harian <i class="i-lucide-arrow-right text-[13px]" /></button>
            </div>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-[12.5px] text-muted">Terpakai hari ini</span>
              <span class="money text-[13.5px] font-600">{{ rp(dayPlanned) }}</span>
            </div>
          </div>
        </template>

        <!-- HARI INI -->
        <template v-else>
          <div class="flex items-baseline justify-between">
            <span class="text-[13px] text-muted">Terpakai hari ini</span>
            <span class="money text-[20px] font-600">{{ rp(dayPlanned) }}</span>
          </div>
          <div v-if="dayCatRows.length" class="border-t border-sand-100 pt-2 flex flex-col">
            <div v-for="c in dayCatRows" :key="c.name" class="flex items-center gap-2 py-[5px]">
              <span class="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center shrink-0" :style="{ background: c.tone[0], color: c.tone[1] }"><i :class="c.icon" class="text-[12px]" /></span>
              <span class="text-[12.5px] text-ink-2 flex-1 truncate">{{ catLabel(c.name) }}</span>
              <span class="money text-[12.5px] font-600">{{ rp(c.planned) }}</span>
            </div>
          </div>
          <div v-else class="text-[12.5px] text-muted">Belum ada biaya di hari ini.</div>
        </template>
      </div>

      <MapsPanel
        heading="Peta hari ini"
        :stops="dayPlaces"
        :single="{ name: trip.place, placeId: trip.placeId }"
        :context="trip.place"
      />

      <DaysOutfitCard :trip="trip" :day-idx="dayIdx" />
    </div>
  </div>
</template>
