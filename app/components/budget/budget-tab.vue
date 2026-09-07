<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp, shortRp } from '~/utils/format'
import { catSlug, tone } from '~/utils/categories'

const props = withDefaults(defineProps<{ trip: Trip; template?: boolean }>(), { template: false })
const trips = useTripsStore()
const ui = useUiStore()
const route = useRoute()
const { flash } = useToast()
const { budget, categories, donut, loose } = useDerived(() => props.trip)

// deep-link: /trip/:id/budget?cat=<name> opens + scrolls to that category
onMounted(() => {
  const cat = route.query.cat as string | undefined
  if (!cat) return
  ui.openCat = cat
  nextTick(() => {
    document.getElementById(catSlug(cat))?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
})

const locked = computed(() => budget.value.locked)
const activeName = computed({
  get: () => budget.value.activeB.name,
  set: (v: string) =>
    trips.patchTrip(props.trip.id, (t) => {
      const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
      if (b) b.name = v
      return t
    }),
})

const newCatName = ref('')
const newCatAmount = ref(0)
const newCatIcon = ref('i-lucide-ellipsis')
const newCatTone = computed(() => tone(newCatName.value || 'Lain'))
function addCategory() {
  const name = newCatName.value.trim()
  if (!name) return
  trips.addCategory(props.trip.id, name, newCatAmount.value, newCatIcon.value)
  newCatName.value = ''
  newCatAmount.value = 0
  newCatIcon.value = 'i-lucide-ellipsis'
}
function newVersion() {
  trips.addBudgetVersion(props.trip.id)
  flash('Versi anggaran baru dibuat')
}
function versionTotal(b: Trip['budgets'][number]) {
  return Object.values(b.alloc).reduce((n, v) => n + v, 0)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- version bar -->
    <div v-if="!template" class="flex items-center gap-3 flex-wrap">
      <span class="eyebrow">Versi rencana</span>
      <button
        v-for="b in trip.budgets"
        :key="b.id"
        class="rounded-field px-[14px] py-[9px] text-left transition-colors"
        :class="b.id === trip.activeBudget ? 'bg-teal-600 text-white' : 'bg-white border border-sand-line hover:bg-sand-100'"
        @click="trips.setActiveBudget(trip.id, b.id)"
      >
        <div class="flex items-center gap-3">
          <span class="text-[13.5px] font-700">{{ b.name }}</span>
          <span class="money text-[12px]" :class="b.id === trip.activeBudget ? 'text-teal-100' : 'text-muted'">{{ shortRp(versionTotal(b)) }}</span>
        </div>
      </button>
      <CoreButton v-if="!locked" variant="ghost" class="!px-[14px] !py-[9px] !text-[13px]" @click="newVersion">+ Versi baru</CoreButton>
    </div>

    <!-- locked notice -->
    <div v-if="locked" class="bg-sand-100 rounded-[16px] p-[14px_16px] text-[13.5px] text-ink-2 flex items-start gap-2">
      <i class="i-lucide-lock text-warn-fg2 text-[16px] mt-[1px] shrink-0" />
      <span>Trip sedang jalan, jadi anggaran dikunci. Angka rencana tidak bisa diubah supaya laporan tetap sesuai kondisi berangkat.</span>
    </div>

    <!-- summary -->
    <div v-if="template" class="card p-[18px_22px] flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <input
          v-model="activeName"
          class="font-display text-[19px] font-600 bg-white border border-sand-line2 rounded-[10px] px-[10px] py-[6px] outline-none focus:border-teal-600"
        >
        <span class="rounded-pill px-[10px] py-[4px] text-[11px] font-700 bg-teal-100 text-teal-700">Anggaran template</span>
      </div>
      <div class="money text-[22px] font-600">{{ rp(budget.allocTotal) }} <span class="text-muted text-[13px] font-500">total rencana</span></div>
    </div>
    <div v-else class="card p-[20px_22px] flex items-center gap-6 flex-wrap">
      <div
        class="w-[110px] h-[110px] rounded-full shrink-0 flex items-center justify-center"
        :style="{ background: `conic-gradient(${donut})` }"
      >
        <div class="w-[74px] h-[74px] rounded-full bg-white flex flex-col items-center justify-center">
          <span class="money text-[18px] font-600">{{ shortRp(budget.spent) }}</span>
          <span class="text-[10.5px] text-muted">terpakai</span>
        </div>
      </div>
      <div class="flex-1 min-w-[280px]">
        <div class="flex items-center gap-3">
          <input
            v-if="!locked"
            v-model="activeName"
            class="font-display text-[19px] font-600 bg-white border border-sand-line2 rounded-[10px] px-[10px] py-[6px] outline-none focus:border-teal-600"
          >
          <span v-else class="font-display text-[19px] font-600">{{ activeName }}</span>
          <span class="rounded-pill px-[10px] py-[4px] text-[11px] font-700" :class="locked ? 'bg-sand-100 text-warn-fg2' : 'bg-teal-100 text-teal-700'">
            {{ locked ? 'Terkunci' : 'Bisa diubah' }}
          </span>
        </div>
        <div class="money text-[24px] font-600 mt-2">{{ rp(budget.spent) }} <span class="text-muted text-[16px]">/ {{ rp(budget.allocTotal) }}</span></div>
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <span v-for="c in categories" :key="c.name" class="inline-flex items-center gap-[6px] text-[12px] text-ink-2">
            <span class="w-[9px] h-[9px] rounded-full" :style="{ background: c.segColor }" />
            {{ c.name }} <span class="text-muted money">{{ c.sharePct }}%</span>
          </span>
        </div>
      </div>
    </div>

    <!-- category table -->
    <div class="card p-[16px_22px] overflow-x-auto">
      <div :class="template ? '' : 'min-w-[560px]'">
      <div class="flex items-center gap-3 pb-2 border-b border-sand-line">
        <span class="eyebrow flex-1">Kategori</span>
        <span v-if="!template" class="eyebrow w-[120px] text-right">Terpakai</span>
        <span class="eyebrow w-[130px] text-right">Alokasi</span>
        <span v-if="!template" class="eyebrow w-[96px]">Progres</span>
        <span class="w-[30px]" />
      </div>
      <BudgetCategoryRow v-for="c in categories" :key="c.name" :row="c" :trip-id="trip.id" :locked="locked" :template="template" />

      <div v-if="!locked" class="flex items-center gap-3 mt-3 bg-paper rounded-field p-[10px_12px]">
        <BudgetIconPicker :icon="newCatIcon" :bg="newCatTone[0]" :fg="newCatTone[1]" @select="newCatIcon = $event" />
        <input v-model="newCatName" placeholder="Kategori sendiri, mis. Oleh-oleh" class="flex-1 bg-transparent outline-none text-[14px]" @keydown.enter="addCategory">
        <CoreMoneyInput
          :model-value="newCatAmount"
          input-class="w-[110px] text-right money text-[14px] bg-white border border-sand-line2 rounded-[10px] px-[10px] py-[7px] outline-none focus:border-teal-600"
          @update:model-value="newCatAmount = $event"
          @keydown.enter="addCategory"
        />
        <CoreButton variant="teal" class="!px-[16px] !py-[8px] !text-[13px]" @click="addCategory">Tambah</CoreButton>
      </div>
      </div>
    </div>

    <!-- loose lines warning -->
    <div v-if="!template && loose.length" class="bg-sand-100 rounded-[16px] p-[12px_16px] text-[12.5px] text-warn-fg2">
      Ada pengeluaran di kategori {{ loose.join(', ') }} yang tidak ada di versi ini. Tambahkan lagi kategorinya atau pindahkan barisnya di Pengeluaran.
    </div>

    <BudgetCompareMatrix v-if="!template" :trip="trip" />
  </div>
</template>
