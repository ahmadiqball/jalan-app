<script setup lang="ts">
import type { CategoryRow } from '~/utils/derive'
import { catSlug } from '~/utils/categories'

const props = defineProps<{ row: CategoryRow; tripId: string; locked: boolean }>()
const trips = useTripsStore()
const ui = useUiStore()
const { flash } = useToast()

const open = computed(() => ui.openCat === props.row.name)
function toggle() {
  ui.openCat = open.value ? null : props.row.name
}
function onAlloc(e: Event) {
  const v = parseInt((e.target as HTMLInputElement).value.replace(/[^0-9]/g, '') || '0', 10)
  trips.setAlloc(props.tripId, props.row.name, v)
}
function remove(e: Event) {
  e.stopPropagation()
  trips.deleteCategory(props.tripId, props.row.name)
  flash('Kategori ' + props.row.name + ' dihapus')
}
</script>

<template>
  <div :id="catSlug(row.name)" class="border-b border-sand-100 scroll-mt-[160px]">
    <div class="flex items-center gap-3 py-[11px] cursor-pointer" @click="toggle">
      <div class="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shrink-0" :style="{ background: row.iconBg, color: row.iconFg }">
        <span class="w-[9px] h-[9px] rounded-full" :style="{ background: row.segColor }" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[14px] font-600 truncate">{{ row.name }}</div>
        <div class="text-[11.5px] text-muted">{{ row.lineCount }} baris</div>
      </div>

      <div class="w-[120px] text-right money text-[13.5px] shrink-0" :style="{ color: row.spentFg }">{{ row.spentRp }}</div>

      <div class="w-[130px] text-right shrink-0" @click.stop>
        <span v-if="locked" class="money text-[13.5px] text-ink-2">{{ row.allocRp }}</span>
        <input
          v-else
          :value="row.allocInput"
          placeholder="0"
          class="w-[120px] text-right money text-[13.5px] bg-white border border-sand-line2 rounded-[10px] px-[10px] py-[7px] outline-none focus:border-teal-600"
          @input="onAlloc"
        >
      </div>

      <div class="w-[96px] shrink-0"><CoreBar :pct="row.pct" :color="row.barColor" :height="8" /></div>

      <div class="w-[30px] shrink-0 flex justify-end">
        <button
          v-if="row.canDelete"
          class="w-[30px] h-[30px] rounded-full bg-paper border border-sand-line flex items-center justify-center text-muted hover:text-warn-fg hover:border-warn-fg"
          title="Hapus kategori"
          @click="remove"
        >
          <i class="i-lucide-trash-2 text-[14px]" />
        </button>
      </div>
    </div>

    <div v-if="open && row.lines.length" class="pb-3">
      <div v-for="(l, i) in row.lines" :key="i" class="flex items-center justify-between pl-[64px] py-[6px]">
        <span class="text-[13px] text-ink-2 truncate flex items-center gap-2">
          <i :class="l.derived ? 'i-lucide-corner-down-right' : 'i-lucide-square'" class="text-[13px] text-muted" />
          {{ l.title }}
        </span>
        <span class="money text-[13px] shrink-0">{{ l.amountRp }}</span>
      </div>
    </div>
  </div>
</template>
