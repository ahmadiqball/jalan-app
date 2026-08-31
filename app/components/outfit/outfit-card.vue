<script setup lang="ts">
import type { OutfitSet, Trip } from '~/types/domain'
import { OF_SLOTS, ofText } from '~/utils/categories'

const props = defineProps<{ trip: Trip; set: OutfitSet }>()
const emit = defineEmits<{ remove: [] }>()
const trips = useTripsStore()

const isDay = computed(() => props.set.scope.startsWith('day:'))
const filled = computed(() => !!ofText(props.set))

const scope = computed({
  get: () => props.set.scope,
  set: (v: string) => trips.setOutfitScope(props.trip.id, props.set.id, v),
})
function setSlot(slot: 'top' | 'bottom' | 'shoes' | 'other', v: string) {
  trips.setOutfitSlot(props.trip.id, props.set.scope, slot, v)
}
</script>

<template>
  <div class="card p-[16px_18px] flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="rounded-pill px-[11px] py-[5px] text-[11.5px] font-700" :class="isDay ? 'bg-teal-100 text-teal-700' : 'bg-warn-bg text-warn-fg'">
        {{ isDay ? 'Satu hari' : 'Aktivitas' }}
      </span>
      <div class="flex items-center gap-2">
        <span v-if="filled" class="text-[11.5px] text-muted">Sudah diisi</span>
        <button class="w-[26px] h-[26px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center" @click="emit('remove')">
          <i class="i-lucide-x text-[15px]" />
        </button>
      </div>
    </div>

    <div>
      <div class="eyebrow !text-[10.5px] mb-1">Untuk</div>
      <OutfitScopePicker v-model="scope" :trip="trip" />
    </div>

    <div class="flex flex-col gap-2">
      <label v-for="[k, label, ph, icon] in OF_SLOTS" :key="k" class="flex items-center gap-2 bg-paper rounded-field px-[12px] py-[9px]">
        <i :class="icon" class="text-[16px] text-teal-700 shrink-0" />
        <input
          :value="set[k]"
          :placeholder="label + ', mis. ' + ph"
          class="flex-1 bg-transparent outline-none text-[13.5px] min-w-0"
          @input="setSlot(k, ($event.target as HTMLInputElement).value)"
        >
      </label>
    </div>
  </div>
</template>
