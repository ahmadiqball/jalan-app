<script setup lang="ts">
import type { Trip } from '~/types/domain'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()

function addSet() {
  // pick the first day without a day-scoped outfit, else day 0
  const used = new Set(props.trip.outfitSets.filter((o) => o.scope.startsWith('day:')).map((o) => o.scope))
  let scope = 'day:0'
  for (let i = 0; i < props.trip.days.length; i++) {
    if (!used.has('day:' + i)) { scope = 'day:' + i; break }
  }
  trips.addOutfitSet(props.trip.id, scope)
  flash('Outfit ditambahkan')
}
function removeSet(id: string) {
  trips.removeOutfit(props.trip.id, id)
  flash('Set outfit dihapus')
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="bg-teal-100 rounded-card p-[16px_18px] flex items-start gap-3">
      <i class="i-lucide-info text-teal-700 text-[18px] mt-[1px] shrink-0" />
      <div class="text-[13.5px] text-teal-700">
        Outfit bisa dipasang untuk satu hari penuh atau untuk satu aktivitas. Outfit yang sudah diisi ikut muncul di kartu aktivitas hari itu.
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="font-display text-[24px] font-600">Outfit</div>
      <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="addSet">+ Tambah outfit</CoreButton>
    </div>

    <div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
      <OutfitCard
        v-for="s in trip.outfitSets"
        :key="s.id"
        :trip="trip"
        :set="s"
        @remove="removeSet(s.id)"
      />
      <button
        v-if="!trip.outfitSets.length"
        class="border border-dashed border-sand-line3 rounded-card min-h-[200px] flex flex-col items-center justify-center gap-2 text-muted hover:border-teal-600 hover:text-teal-700"
        @click="addSet"
      >
        <i class="i-lucide-shirt text-[26px]" />
        <span class="text-[13.5px] font-600">Belum ada outfit</span>
      </button>
    </div>
  </div>
</template>
