<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { DUR_STEPS, durLabel, nearestDur, rp } from '~/utils/format'
import { ofItems, tone, iconFor } from '~/utils/categories'
import { outfitFind, outfitDaySet } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()

const found = computed(() => {
  for (let di = 0; di < props.trip.days.length; di++) {
    const a = props.trip.days[di]!.acts.find((x) => x.id === ui.activityId)
    if (a) return { act: a, dayIdx: di, day: props.trip.days[di]! }
  }
  return null
})
const open = computed({
  get: () => !!ui.activityId && !!found.value,
  set: (v: boolean) => { if (!v) ui.selectActivity(null) },
})

function set<K extends 'title' | 'time' | 'place' | 'note' | 'cat'>(field: K, v: string) {
  if (found.value) trips.setActivityField(props.trip.id, found.value.act.id, field, v)
}
const costModel = computed({
  get: () => (found.value?.act.cost ? String(found.value.act.cost) : ''),
  set: (v: string) => found.value && trips.setActivityField(props.trip.id, found.value.act.id, 'cost', parseInt(v.replace(/[^0-9]/g, '') || '0', 10)),
})
const durModel = computed({
  get: () => String(nearestDur(found.value?.act.dur || 0)),
  set: (v: string) => found.value && trips.setActivityField(props.trip.id, found.value.act.id, 'dur', parseInt(v, 10)),
})
const durOptions = DUR_STEPS.map((m) => ({ value: String(m), label: durLabel(m) }))
const cats = [...CATEGORIES, 'Santai', 'Tempat']

const costSub = computed(() => {
  const a = found.value?.act
  if (!a) return ''
  return a.cost ? `${props.trip.people} orang · ${rp(a.cost / props.trip.people)} per orang` : 'Aktivitas ini tidak masuk anggaran'
})
const resolvedSet = computed(() => {
  if (!found.value) return null
  return outfitFind(props.trip, 'act:' + found.value.act.id) || outfitDaySet(props.trip, found.value.dayIdx)
})
const resolvedItems = computed(() => ofItems(resolvedSet.value))
const t = computed(() => (found.value ? tone(found.value.act.cat) : ['#F1EEE1', '#8A6314']))

function del() {
  if (!found.value) return
  trips.deleteActivity(props.trip.id, found.value.act.id)
  ui.selectActivity(null)
  flash('Aktivitas dihapus')
}
</script>

<template>
  <CoreDialog v-model:open="open" :width="520" title="Detail aktivitas">
    <div v-if="found" class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <div class="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0" :style="{ background: t[0], color: t[1] }">
          <i :class="iconFor(found.act.cat)" class="text-[20px]" />
        </div>
        <div class="text-[12.5px] text-muted">{{ found.day.long }}</div>
      </div>

      <label class="flex flex-col gap-[6px]">
        <span class="eyebrow">Judul</span>
        <input :value="found.act.title" class="field !text-[16px] !font-600" @input="set('title', ($event.target as HTMLInputElement).value)">
      </label>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Jam</span>
          <input :value="found.act.time" placeholder="13.40" class="field money" @input="set('time', ($event.target as HTMLInputElement).value)">
        </label>
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Durasi</span>
          <CoreSelect v-model="durModel" :options="durOptions" />
        </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Kategori</span>
          <CoreSelect :model-value="found.act.cat" :options="cats" @update:model-value="set('cat', $event)" />
        </label>
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Biaya</span>
          <input v-model="costModel" placeholder="0" class="field money">
        </label>
      </div>
      <div class="text-[12.5px] text-muted -mt-2">{{ costSub }}</div>

      <label class="flex flex-col gap-[6px]">
        <span class="eyebrow">Tempat</span>
        <input :value="found.act.place" placeholder="Belum ada tempat" class="field" @input="set('place', ($event.target as HTMLInputElement).value)">
      </label>

      <label class="flex flex-col gap-[6px]">
        <span class="eyebrow">Catatan</span>
        <textarea :value="found.act.note" rows="3" placeholder="Tambah catatan…" class="field resize-none" @input="set('note', ($event.target as HTMLTextAreaElement).value)" />
      </label>

      <div class="bg-paper rounded-card p-[14px_16px]">
        <div class="eyebrow mb-2">Outfit</div>
        <div v-if="resolvedItems.length" class="flex flex-col gap-2">
          <div v-for="it in resolvedItems" :key="it.label" class="flex items-center gap-2 text-[13.5px]">
            <i :class="it.icon" class="text-[15px] text-teal-700" />
            <span class="text-muted w-[70px]">{{ it.label }}</span>
            <span>{{ it.value }}</span>
          </div>
        </div>
        <div v-else class="text-[13px] text-muted">Outfit hari ini belum diisi.</div>
        <NuxtLink :to="`/trip/${trip.id}/outfit`" class="text-[13px] font-600 text-teal-600 mt-2 inline-block" @click="open = false">Atur di Outfit</NuxtLink>
      </div>
    </div>

    <template #footer>
      <button class="text-warn-fg text-[13.5px] font-600 flex items-center gap-2 hover:underline" @click="del">
        <i class="i-lucide-trash-2 text-[15px]" /> Hapus aktivitas
      </button>
    </template>
  </CoreDialog>
</template>
